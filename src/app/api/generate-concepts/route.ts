import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { buildSystemPrompt } from '@/lib/ai/system-prompt'
import { buildCatalogueContext } from '@/lib/ai/catalogue-context'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SAVE_CONCEPTS_TOOL: Anthropic.Tool = {
  name: 'save_concepts',
  description: 'Save the generated R&D concepts to the database',
  input_schema: {
    type: 'object' as const,
    properties: {
      narrative: {
        type: 'string',
        description: 'Brief tensions — 1 paragraph max. Name each conflict and how you resolved it.',
      },
      recommendation: {
        type: 'string',
        description: 'Which concept to prototype and why. 1–2 sentences.',
      },
      collection_name: {
        type: 'string',
        description: 'Menu collection only: short working title for this collection',
      },
      concepts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            concept_name: { type: 'string' },
            one_line: { type: 'string' },
            breakdown: {
              type: 'object',
              properties: {
                hero: { type: 'string', description: '1 short phrase — primary ingredient and technique.' },
                flavor_drivers: { type: 'array', items: { type: 'string' }, description: '3 items max.' },
                textures: { type: 'array', items: { type: 'string' }, description: '3 items max.' },
                key_contrast: { type: 'string', description: '1 sentence.' },
              },
              required: ['hero', 'flavor_drivers', 'textures', 'key_contrast'],
            },
            presentation: { type: 'string', description: '2 sentences max. What the dish looks like on the plate and how it arrives.' },
            why_it_could_win: {
              type: 'object',
              properties: {
                menu_gap: { type: 'string', description: '1 sentence. Which specific gap this addresses.' },
                emotional_trigger: { type: 'string', description: '1 sentence. What the guest feels.' },
                salted_olive: { type: 'string', description: '1 sentence. Why this belongs at Salted Olive specifically.' },
              },
              required: ['menu_gap', 'emotional_trigger', 'salted_olive'],
            },
            feasibility: {
              type: 'object',
              properties: {
                assets_leveraged: { type: 'array', items: { type: 'string' }, description: '3 items max.' },
                watchouts: { type: 'array', items: { type: 'string' }, description: '3 items max.' },
              },
              required: ['assets_leveraged', 'watchouts'],
            },
            experiment_focus: { type: 'array', items: { type: 'string' }, description: '3 items max.' },
          },
          required: ['concept_name', 'one_line', 'why_it_could_win', 'experiment_focus'],
        },
      },
    },
    required: ['narrative', 'concepts'],
  },
}

function buildBriefMessage(brief: Record<string, unknown>, explorationMode: string, recentConcepts: { name: string; hero: string | null }[] = []): string {
  const generationMode = (brief.generation_mode as string) ?? 'full'

  const lines: string[] = [
    `Exploration Mode: ${explorationMode}`,
    `Generation Mode: ${generationMode}`,
    '',
    'Here is a completed R&D Brief. Generate concepts now.\n',
  ]

  lines.push(`Brief Type: ${brief.brief_type === 'menu_collection' ? 'Menu Collection' : 'Single Dish'}`)

  if (brief.brief_type !== 'menu_collection') {
    lines.push('Generate exactly 1 concept.')
  }

  if (brief.brief_type === 'menu_collection') {
    if (brief.menu_theme) lines.push(`Menu Theme: ${brief.menu_theme}`)
    if (brief.menu_composition && !brief.ai_recommend_composition) {
      const comp = brief.menu_composition as Record<string, number>
      const parts = Object.entries(comp).filter(([, n]) => n > 0).map(([cat, n]) => `${n} ${cat}`)
      if (parts.length) lines.push(`Menu Composition: ${parts.join(', ')}`)
    } else if (brief.ai_recommend_composition) {
      lines.push('Menu Composition: Recommend composition based on the theme and gaps')
    }
  } else {
    if (brief.menu_theme) lines.push(`Working Title: ${brief.menu_theme}`)
    if (brief.category) lines.push(`Category: ${brief.category}`)
  }

  const roles = (brief.strategic_roles as string[] | null) ?? []
  if (roles.length) lines.push(`Strategic Role(s): ${roles.join(', ')}`)

  if (brief.format_familiarity != null) lines.push(`Format Familiarity (FF): ${brief.format_familiarity}`)
  if (brief.flavor_discovery != null) lines.push(`Flavor Discovery (FD): ${brief.flavor_discovery}`)

  const assets = (brief.pantry_assets as string[] | null) ?? []
  if (assets.length) {
    lines.push(`Pantry Asset(s) to Feature: ${assets.join(', ')}`)
  } else {
    lines.push('Pantry Asset(s) to Feature: AI to recommend based on gaps')
  }

  if (brief.opportunity) lines.push(`\nOpportunity:\n${brief.opportunity}`)
  if (brief.creative_references) lines.push(`\nCreative References:\n${brief.creative_references}`)
  if (brief.desired_feeling) lines.push(`\nDesired Guest Feeling:\n${brief.desired_feeling}`)
  if (brief.constraints) lines.push(`\nConstraints:\n${brief.constraints}`)

  if (recentConcepts.length > 0) {
    lines.push(`\nAlready generated for this brief — across all exploration modes:`)
    recentConcepts.forEach(({ name, hero }) => {
      lines.push(`- ${name}${hero ? ` [${hero}]` : ''}`)
    })
    lines.push(`\nAvoid repeating the same combination of primary protein and cooking technique. If you use the same protein as a previous concept, the cooking method and flavor direction must be meaningfully different.`)
  }

  return lines.join('\n')
}

export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const { briefId, explorationMode: bodyMode } = await req.json()
    if (!briefId) return NextResponse.json({ error: 'briefId required' }, { status: 400 })

    const supabase = await createClient()
    const { data: brief, error: briefError } = await supabase
      .from('rd_briefs')
      .select('*')
      .eq('id', briefId)
      .single()

    if (briefError || !brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
    }

    const explorationMode = (bodyMode && ['safe', 'balanced', 'exploratory'].includes(bodyMode))
      ? bodyMode as string
      : 'balanced'

    const catalogueCtx = await buildCatalogueContext(supabase)
    const SYSTEM_PROMPT = buildSystemPrompt(catalogueCtx)

    const isFast = brief.generation_mode === 'fast'
    const maxTokens = isFast ? 1200 : 3000

    // Dedup across ALL exploration modes for this brief — protein/technique diversity
    // is brief-scoped, not mode-scoped. Exploratory should know what balanced already did.
    const { data: recentRaw } = await supabase
      .from('rd_concepts')
      .select('concept_name, breakdown')
      .eq('brief_id', briefId)
      .order('created_at', { ascending: false })
      .limit(15)
    const recentConcepts = (recentRaw ?? []).map((r) => ({
      name: r.concept_name,
      hero: (r.breakdown as { hero?: string } | null)?.hero ?? null,
    }))

    const userMessage = buildBriefMessage(brief, explorationMode, recentConcepts)
    const estInputTokens = Math.round(SYSTEM_PROMPT.length / 3) + Math.round(userMessage.length / 4)
    console.log('[generate-concepts] Calling Claude', {
      mode: `${brief.brief_type} / ${brief.generation_mode}`,
      estInputTokens,
      maxOutputTokens: maxTokens,
    })
    const t0 = Date.now()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      tools: [SAVE_CONCEPTS_TOOL],
      tool_choice: { type: 'any' },
      messages: [{ role: 'user', content: userMessage }],
    })

    const cacheRead = (message.usage as unknown as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0
    console.log(`[generate-concepts] Done in ${Date.now() - t0}ms`, {
      stop_reason: message.stop_reason,
      input_tokens: message.usage.input_tokens + cacheRead,
      output_tokens: message.usage.output_tokens,
      cache_hit: cacheRead > 0,
    })

    if (message.stop_reason === 'max_tokens') {
      return NextResponse.json({ error: 'Generation exceeded token limit — try Fast mode or reduce the number of dishes' }, { status: 500 })
    }

    const toolUse = message.content.find((b) => b.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') {
      return NextResponse.json({ error: 'No tool call in response' }, { status: 500 })
    }

    const output = toolUse.input as {
      narrative: string
      recommendation?: string
      collection_name?: string
      concepts: Array<{
        concept_name: string
        one_line: string
        breakdown: { hero: string; flavor_drivers: string[]; textures: string[]; key_contrast: string }
        presentation: string
        why_it_could_win: { menu_gap: string; emotional_trigger: string; salted_olive: string }
        feasibility: { assets_leveraged: string[]; watchouts: string[] }
        experiment_focus: string[]
      }>
    }

    // Save output metadata to the brief
    await supabase
      .from('rd_briefs')
      .update({
        output_data: {
          narrative: output.narrative,
          recommendation: output.recommendation ?? null,
          collection_name: output.collection_name ?? null,
        },
      })
      .eq('id', briefId)

    // Save concepts
    const conceptRows = output.concepts.map((c) => ({
      brief_id: briefId,
      concept_name: c.concept_name,
      one_line: c.one_line,
      breakdown: c.breakdown,
      presentation: c.presentation,
      why_it_could_win: c.why_it_could_win,
      feasibility: c.feasibility,
      experiment_focus: c.experiment_focus,
      status: 'generated',
      exploration_mode: explorationMode,
    }))

    const { error: insertError } = await supabase.from('rd_concepts').insert(conceptRows)
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, conceptCount: conceptRows.length })
  } catch (err) {
    console.error('generate-concepts error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
