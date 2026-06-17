import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const RECIPE_SYSTEM_PROMPT = `You are the recipe development assistant for Salted Olive — a contemporary Eastern Mediterranean restaurant in Jakarta, Indonesia.

Translate an approved R&D concept into a structured prototype recipe for test kitchen trial.

Rules:
- Scale for 1–2 test portions
- Write for a professional kitchen: precise quantities (grams, ml, °C), standard equipment
- Method steps are direct instructions only — no explanations
- Pantry products (labneh, nduja sauce, amba sauce, hot honey, muhammara, herb yoghurt, tzatziki, chimichurri, tapenade, habanero sauce, green sauce, watermelon dressing, shawarma spice blend, spicy za'atar, dukkah, sumac onion) are pre-made — list them as components with quantity only
- Success criteria must directly address the testable hypotheses from the experiment focus

Call the save_recipe tool. Do not output any prose outside the tool call.`

const SAVE_RECIPE_TOOL: Anthropic.Tool = {
  name: 'save_recipe',
  description: 'Save the prototype recipe for this R&D concept',
  input_schema: {
    type: 'object' as const,
    properties: {
      concept_intent: {
        type: 'string',
        description: '1 sentence — the core testable idea this recipe is designed to prove.',
      },
      components: {
        type: 'array',
        description: 'All ingredients needed. Be complete but concise.',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            quantity: { type: 'string', description: 'Grams, ml, or count. Short.' },
            notes: { type: 'string', description: 'Prep state in 3 words max. Empty string if none.' },
          },
          required: ['name', 'quantity', 'notes'],
        },
      },
      method: {
        type: 'array',
        items: { type: 'string' },
        description: 'Ordered method steps. Each step is one direct instruction — 15 words max. No explanations.',
      },
      plating_notes: {
        type: 'string',
        description: '1–2 sentences. How to plate for the test.',
      },
      yield: {
        type: 'object',
        properties: {
          serves: { type: 'number' },
          portion_size: { type: 'string' },
        },
        required: ['serves', 'portion_size'],
      },
      success_criteria: {
        type: 'array',
        items: { type: 'string' },
        description: 'What to evaluate in the test kitchen. Derived from experiment focus. 3 items max.',
      },
    },
    required: ['concept_intent', 'components', 'method', 'plating_notes', 'yield', 'success_criteria'],
  },
}

function buildRecipeMessage(concept: Record<string, unknown>): string {
  const breakdown = concept.breakdown as {
    hero?: string
    flavor_drivers?: string[]
    textures?: string[]
    key_contrast?: string
  } | null

  const lines = [
    `Generate a prototype recipe for this R&D concept.\n`,
    `Concept: ${concept.concept_name}`,
    `One-liner: ${concept.one_line}`,
  ]

  if (breakdown?.hero) lines.push(`Hero ingredient/technique: ${breakdown.hero}`)
  if (breakdown?.flavor_drivers?.length) lines.push(`Flavor drivers: ${breakdown.flavor_drivers.join(', ')}`)
  if (breakdown?.key_contrast) lines.push(`Key contrast: ${breakdown.key_contrast}`)
  if (concept.presentation) lines.push(`\nPresentation intent: ${concept.presentation}`)

  const focus = concept.experiment_focus as string[] | null
  if (focus?.length) {
    lines.push(`\nExperiment focus (what to test):\n${focus.map((f) => `- ${f}`).join('\n')}`)
  }

  return lines.join('\n')
}

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { conceptId } = await req.json()
    if (!conceptId) return NextResponse.json({ error: 'conceptId required' }, { status: 400 })

    console.log('[generate-recipe] Request received for concept:', conceptId)

    const supabase = await createClient()
    const { data: concept, error: conceptError } = await supabase
      .from('rd_concepts')
      .select('*')
      .eq('id', conceptId)
      .single()

    if (conceptError || !concept) {
      console.error('[generate-recipe] Concept not found:', conceptId, conceptError)
      return NextResponse.json({ error: 'Concept not found' }, { status: 404 })
    }

    console.log('[generate-recipe] Calling Claude for:', concept.concept_name)
    const userMessage = buildRecipeMessage(concept)
    const t0 = Date.now()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      system: RECIPE_SYSTEM_PROMPT,
      tools: [SAVE_RECIPE_TOOL],
      tool_choice: { type: 'any' },
      messages: [{ role: 'user', content: userMessage }],
    })

    console.log(`[generate-recipe] Done in ${Date.now() - t0}ms`, {
      stop_reason: message.stop_reason,
      output_tokens: message.usage.output_tokens,
    })

    if (message.stop_reason === 'max_tokens') {
      return NextResponse.json({ error: 'Generation exceeded token limit' }, { status: 500 })
    }

    const toolUse = message.content.find((b) => b.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') {
      return NextResponse.json({ error: 'No tool call in response' }, { status: 500 })
    }

    const output = toolUse.input as {
      concept_intent: string
      components: Array<{ name: string; quantity: string; notes: string }>
      method: string[]
      plating_notes: string
      yield: { serves: number; portion_size: string }
      success_criteria: string[]
    }

    const { data: existing } = await supabase
      .from('rd_recipes')
      .select('version')
      .eq('concept_id', conceptId)
      .order('version', { ascending: false })
      .limit(1)
      .single()

    const nextVersion = existing ? existing.version + 1 : 1

    const { error: insertError } = await supabase.from('rd_recipes').insert({
      concept_id: conceptId,
      version: nextVersion,
      concept_intent: output.concept_intent,
      components: output.components,
      method: output.method,
      plating_notes: output.plating_notes,
      yield: output.yield,
      success_criteria: output.success_criteria,
      status: 'draft',
    })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('generate-recipe error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
