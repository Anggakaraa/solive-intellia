'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'

const mockRecipe = (conceptId: string, conceptIntent: string, successCriteria: string[]) => ({
  concept_id: conceptId,
  version: 1,
  concept_intent: conceptIntent,
  components: [
    { name: 'Cauliflower', quantity: '1 whole (~800g)', notes: 'Outer leaves removed, stem trimmed flat' },
    { name: 'House Labneh', quantity: '80g', notes: 'Whipped with olive oil until smooth' },
    { name: 'Aleppo Oil', quantity: '20ml', notes: 'Drizzled to finish' },
    { name: 'Pine Nuts', quantity: '15g', notes: 'Toasted golden' },
    { name: 'Herb Salad', quantity: '20g', notes: 'Parsley, mint, dressed with lemon' },
    { name: 'Olive Oil', quantity: '30ml', notes: 'For roasting' },
    { name: 'Sea Salt & Cumin', quantity: 'to taste', notes: '' },
  ],
  method: [
    'Preheat oven to 220°C fan.',
    'Rub cauliflower all over with olive oil, salt, and a pinch of cumin.',
    'Roast on a tray for 35–40 min, turning once, until deeply charred outside and tender throughout — a skewer should pass through the centre with no resistance.',
    'While roasting, whip labneh with a splash of olive oil and a squeeze of lemon until loose and spreadable.',
    'Toast pine nuts in a dry pan over medium heat until golden. Set aside.',
    'Spread labneh across the base of the serving plate.',
    'Place cauliflower on top. Drizzle generously with Aleppo oil.',
    'Scatter pine nuts and herb salad. Serve immediately — whole.',
  ],
  plating_notes: 'Serve whole. Do not cut before service — the visual impact is the point. The labneh spread should extend beyond the cauliflower edge so it\'s visible.',
  yield: { serves: 1, portion_size: '~450g plated' },
  success_criteria: successCriteria,
  test_kitchen_notes: '',
  status: 'draft',
})

interface Props {
  conceptId: string
  experimentFocus: string[]
  conceptIntent: string
}

export function GenerateRecipeButton({ conceptId, experimentFocus, conceptIntent }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleGenerate = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('rd_recipes')
      .insert(mockRecipe(conceptId, conceptIntent, experimentFocus))

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // Update concept status
    await supabase
      .from('rd_concepts')
      .update({ status: 'recipe_generated' })
      .eq('id', conceptId)

    router.push(`/concepts/${conceptId}/recipe`)
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-2 bg-olive text-cream text-sm font-medium px-4 py-2 rounded-md hover:bg-olive-light transition-colors disabled:opacity-60"
    >
      <Sparkles size={14} />
      {loading ? 'Generating…' : 'Generate Prototype Recipe'}
    </button>
  )
}
