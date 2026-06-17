import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt'
import type { CollectionDishSlot } from '@/lib/supabase/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SAVE_COLLECTION_OVERVIEW_TOOL: Anthropic.Tool = {
  name: 'save_collection_overview',
  description: 'Save the collection overview: tensions, narrative, wave structure (set menu only), and dish slots',
  input_schema: {
    type: 'object' as const,
    properties: {
      collection_name: {
        type: 'string',
        description: 'Short evocative working title for this collection',
      },
      tensions: {
        type: 'string',
        description: 'Brief tensions analysis — name and resolve conflicts before generating dish slots. 2–4 paragraphs.',
      },
      narrative: {
        type: 'string',
        description: 'Menu narrative explaining the collection identity, emotional territory, and intent. 3–5 paragraphs.',
      },
      waves: {
        type: 'array',
        description: 'Set / tasting menu only — omit for à la carte. Wave structure showing the progression arc.',
        items: {
          type: 'object',
          properties: {
            wave: { type: 'number' },
            feel: { type: 'string', description: 'Short evocative label for this wave, e.g. "Arrival — immediate and tactile"' },
            categories: { type: 'array', items: { type: 'string' } },
            dish_count: { type: 'number' },
          },
          required: ['wave', 'feel', 'categories', 'dish_count'],
        },
      },
      dishes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            wave: { type: 'number', description: 'Set menu only — wave number this dish belongs to' },
            wave_order: { type: 'number', description: 'Set menu only — position within the wave (1-based)' },
            category: { type: 'string' },
            concept_name: { type: 'string', description: 'Working name for the dish concept' },
            one_line: { type: 'string', description: 'One-sentence description that captures the dish clearly' },
          },
          required: ['category', 'concept_name', 'one_line'],
        },
      },
    },
    required: ['collection_name', 'tensions', 'narrative', 'dishes'],
  },
}

function buildCollectionMessage(brief: Record<string, unknown>): string {
  const isSetMenu = brief.collection_format === 'set_menu'
  const lines: string[] = [
    `Generate a collection overview for this Menu Collection brief.\n`,
    `Collection Format: ${isSetMenu ? 'Set / tasting menu' : 'À la carte collection'}`,
  ]

  if (brief.menu_theme) lines.push(`Theme: ${brief.menu_theme}`)

  if (brief.menu_composition && !brief.ai_recommend_composition) {
    const comp = brief.menu_composition as Record<string, number>
    const parts = Object.entries(comp).filter(([, n]) => n > 0).map(([cat, n]) => `${n} ${cat}`)
    if (parts.length) lines.push(`Requested composition: ${parts.join(', ')}`)
  } else if (brief.ai_recommend_composition) {
    lines.push('Composition: Recommend based on theme, strategic roles, and menu gaps')
  }

  const roles = (brief.strategic_roles as string[] | null) ?? []
  if (roles.length) lines.push(`Strategic Role(s): ${roles.join(', ')}`)
  if (brief.format_familiarity != null) lines.push(`Format Familiarity (FF): ${brief.format_familiarity}`)
  if (brief.flavor_discovery != null) lines.push(`Flavor Discovery (FD): ${brief.flavor_discovery}`)

  const assets = (brief.pantry_assets as string[] | null) ?? []
  if (assets.length) lines.push(`Pantry Asset(s) to Feature: ${assets.join(', ')}`)

  if (brief.opportunity) lines.push(`\nOpportunity:\n${brief.opportunity}`)
  if (brief.creative_references) lines.push(`\nCreative References:\n${brief.creative_references}`)
  if (brief.desired_feeling) lines.push(`\nDesired Guest Feeling:\n${brief.desired_feeling}`)
  if (brief.constraints) lines.push(`\nConstraints:\n${brief.constraints}`)

  lines.push(`\nExploration Mode: ${brief.exploration_mode ?? 'balanced'}`)

  if (isSetMenu) {
    lines.push('\nThis is a set / tasting menu. Design a wave structure (typically 3–4 waves) with a clear progression arc — light to rich, discovery building. Include wave feel, categories, and dish count. Dishes must reference their wave number and position.')
  } else {
    lines.push('\nThis is an à la carte collection. No wave structure. Dishes should feel thematically coherent but can be ordered in any combination. Do not include wave or wave_order in dish slots.')
  }

  lines.push('\nGenerate dish slots only (concept_name + one_line). Do not generate full concept details — those come later per dish.')

  return lines.join('\n')
}

export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const { briefId } = await req.json()
    if (!briefId) return NextResponse.json({ error: 'briefId required' }, { status: 400 })

    const supabase = await createClient()
    const { data: brief, error: briefError } = await supabase
      .from('rd_briefs').select('*').eq('id', briefId).single()

    if (briefError || !brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
    }

    const userMessage = buildCollectionMessage(brief)
    const systemChars = SYSTEM_PROMPT.length
    const userChars = userMessage.length
    console.log('[generate-collection] Payload:', {
      format: brief.collection_format ?? 'a_la_carte',
      systemChars,
      userChars,
      totalChars: systemChars + userChars,
      estInputTokens: Math.round((systemChars + userChars) / 4),
      maxTokens: 4000,
    })
    const t0 = Date.now()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      tools: [SAVE_COLLECTION_OVERVIEW_TOOL],
      tool_choice: { type: 'any' },
      messages: [{ role: 'user', content: userMessage }],
    })

    console.log(`[generate-collection] Claude responded in ${Date.now() - t0}ms`, {
      stop_reason: message.stop_reason,
      input_tokens: message.usage.input_tokens,
      output_tokens: message.usage.output_tokens,
      cache_read_tokens: (message.usage as unknown as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0,
    })

    if (message.stop_reason === 'max_tokens') {
      return NextResponse.json({ error: 'Generation exceeded token limit — try reducing the number of dishes' }, { status: 500 })
    }

    const toolUse = message.content.find((b) => b.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') {
      return NextResponse.json({ error: 'No tool call in response' }, { status: 500 })
    }

    const output = toolUse.input as {
      collection_name: string
      tensions: string
      narrative: string
      waves?: Array<{ wave: number; feel: string; categories: string[]; dish_count: number }>
      dishes: CollectionDishSlot[]
    }

    await supabase.from('rd_briefs').update({
      output_data: {
        type: 'collection',
        collection_name: output.collection_name,
        tensions: output.tensions,
        narrative: output.narrative,
        collection_format: brief.collection_format ?? 'a_la_carte',
        waves: output.waves ?? null,
        dishes: output.dishes,
      },
    }).eq('id', briefId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('generate-collection error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
