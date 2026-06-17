import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SAVE_CONCEPTS_TOOL: Anthropic.Tool = {
  name: 'save_concepts',
  description: 'Save the generated R&D concepts to the database',
  input_schema: {
    type: 'object' as const,
    properties: {
      narrative: {
        type: 'string',
        description: 'Brief tensions (single dish) or collection logic (menu collection) — 2–4 paragraphs',
      },
      recommendation: {
        type: 'string',
        description: 'Single dish only: which concept to prototype and why (1–2 paragraphs)',
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
                hero: { type: 'string' },
                flavor_drivers: { type: 'array', items: { type: 'string' } },
                textures: { type: 'array', items: { type: 'string' } },
                key_contrast: { type: 'string' },
              },
              required: ['hero', 'flavor_drivers', 'textures', 'key_contrast'],
            },
            presentation: { type: 'string' },
            why_it_could_win: {
              type: 'object',
              properties: {
                menu_gap: { type: 'string' },
                emotional_trigger: { type: 'string' },
                salted_olive: { type: 'string' },
              },
              required: ['menu_gap', 'emotional_trigger', 'salted_olive'],
            },
            feasibility: {
              type: 'object',
              properties: {
                assets_leveraged: { type: 'array', items: { type: 'string' } },
                watchouts: { type: 'array', items: { type: 'string' } },
              },
              required: ['assets_leveraged', 'watchouts'],
            },
            experiment_focus: { type: 'array', items: { type: 'string' } },
          },
          required: ['concept_name', 'one_line', 'why_it_could_win', 'experiment_focus'],
        },
      },
    },
    required: ['narrative', 'concepts'],
  },
}

function buildBriefMessage(brief: Record<string, unknown>): string {
  const lines: string[] = ['Here is a completed R&D Brief. Generate concepts now.\n']

  lines.push(`Brief Type: ${brief.brief_type === 'menu_collection' ? 'Menu Collection' : 'Single Dish'}`)

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

  lines.push(`\nExploration Mode: ${brief.exploration_mode ?? 'balanced'}`)
  lines.push(`Generation Mode: ${brief.generation_mode ?? 'full'}`)

  return lines.join('\n')
}

export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const { briefId } = await req.json()
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

    const isFast = brief.generation_mode === 'fast'
    // Full mode: 3 concepts with all fields + narrative + recommendation can hit 4000+
    // giving 6000 headroom ensures we never truncate mid-tool-call
    const maxTokens = isFast ? 2500 : 6000

    const userMessage = buildBriefMessage(brief)
    const systemChars = SYSTEM_PROMPT.length
    const userChars = userMessage.length
    console.log('[generate-concepts] Payload:', {
      mode: `${brief.brief_type} / ${brief.generation_mode}`,
      maxTokens,
      systemChars,
      userChars,
      totalChars: systemChars + userChars,
      estInputTokens: Math.round((systemChars + userChars) / 4),
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

    console.log(`[generate-concepts] Claude responded in ${Date.now() - t0}ms`, {
      stop_reason: message.stop_reason,
      input_tokens: message.usage.input_tokens,
      output_tokens: message.usage.output_tokens,
      cache_read_tokens: (message.usage as unknown as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0,
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
