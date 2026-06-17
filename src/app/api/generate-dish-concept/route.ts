import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt'
import type { CollectionDishSlot, CollectionOutputData } from '@/lib/supabase/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SAVE_DISH_CONCEPT_TOOL: Anthropic.Tool = {
  name: 'save_concepts',
  description: 'Save the full concept for this dish',
  input_schema: {
    type: 'object' as const,
    properties: {
      narrative: { type: 'string', description: 'Not used for dish detail calls — leave empty string' },
      concepts: {
        type: 'array',
        description: 'Exactly 1 concept',
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
          required: ['concept_name', 'one_line', 'breakdown', 'presentation', 'why_it_could_win', 'feasibility', 'experiment_focus'],
        },
      },
    },
    required: ['concepts'],
  },
}

function buildDishMessage(
  brief: Record<string, unknown>,
  outputData: CollectionOutputData,
  slot: CollectionDishSlot
): string {
  const otherDishes = outputData.dishes.filter((d) => d.concept_name !== slot.concept_name)
  const lines = [
    `Generate a full concept for one dish from the "${outputData.collection_name}" collection.\n`,
    `COLLECTION NARRATIVE:`,
    outputData.narrative,
    `\nOTHER DISHES IN THIS COLLECTION (for coherence — avoid duplicating their primary pantry asset):`,
    ...otherDishes.map((d) => `- ${d.concept_name} (${d.category}): ${d.one_line}`),
    `\nDISH TO DEVELOP:`,
    `Category: ${slot.category}`,
  ]

  if (slot.wave) {
    const waveInfo = outputData.waves?.find((w) => w.wave === slot.wave)
    lines.push(`Wave: ${slot.wave}${waveInfo ? ` — ${waveInfo.feel}` : ''}`)
  }

  lines.push(
    `Working name: ${slot.concept_name}`,
    `Established one-liner: ${slot.one_line}`,
    `\nGenerate a Full mode concept. All fields required (breakdown, presentation, why_it_could_win, feasibility, experiment_focus). Keep it coherent with the collection narrative.`,
    `Exploration Mode: ${(brief.exploration_mode as string) ?? 'balanced'}`,
    `Generation Mode: full`,
  )

  return lines.join('\n')
}

export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const { briefId, slot } = await req.json() as { briefId: string; slot: CollectionDishSlot }
    if (!briefId || !slot) return NextResponse.json({ error: 'briefId and slot required' }, { status: 400 })

    const supabase = await createClient()
    const { data: brief, error: briefError } = await supabase
      .from('rd_briefs').select('*').eq('id', briefId).single()

    if (briefError || !brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
    }

    const outputData = brief.output_data as CollectionOutputData
    if (!outputData?.dishes) {
      return NextResponse.json({ error: 'Collection overview not found — generate overview first' }, { status: 400 })
    }

    console.log('[generate-dish-concept] Calling Claude for:', slot.concept_name)
    const t0 = Date.now()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      tools: [SAVE_DISH_CONCEPT_TOOL],
      tool_choice: { type: 'any' },
      messages: [{ role: 'user', content: buildDishMessage(brief, outputData, slot) }],
    })

    console.log(`[generate-dish-concept] Claude responded in ${Date.now() - t0}ms`)

    if (message.stop_reason === 'max_tokens') {
      return NextResponse.json({ error: 'Generation exceeded token limit' }, { status: 500 })
    }

    const toolUse = message.content.find((b) => b.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') {
      return NextResponse.json({ error: 'No tool call in response' }, { status: 500 })
    }

    const output = toolUse.input as {
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

    const concept = output.concepts[0]
    if (!concept) return NextResponse.json({ error: 'No concept in response' }, { status: 500 })

    const { data: saved, error: insertError } = await supabase
      .from('rd_concepts')
      .insert({
        brief_id: briefId,
        concept_name: concept.concept_name,
        one_line: concept.one_line,
        breakdown: concept.breakdown ?? null,
        presentation: concept.presentation ?? null,
        why_it_could_win: concept.why_it_could_win,
        feasibility: concept.feasibility ?? null,
        experiment_focus: concept.experiment_focus ?? [],
        status: 'generated',
      })
      .select()
      .single()

    if (insertError || !saved) {
      return NextResponse.json({ error: insertError?.message ?? 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ success: true, concept: saved })
  } catch (err) {
    console.error('generate-dish-concept error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
