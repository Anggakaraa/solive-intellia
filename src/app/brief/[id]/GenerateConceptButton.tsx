'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { primaryBtnCls, ghostBtnCls } from '@/lib/styles'

// Placeholder concept — replaced by real AI output when connected
const mockConcept = (briefId: string) => ({
  brief_id: briefId,
  concept_name: 'Charred Cauliflower with Whipped Labneh & Aleppo Oil',
  one_line: 'Whole-roasted cauliflower over whipped house labneh, finished with Aleppo oil, pine nuts, and a crisp herb salad.',
  breakdown: {
    hero: 'Cauliflower — whole-roasted until deeply charred',
    flavor_drivers: ['House Labneh', 'Aleppo Oil', 'Lemon'],
    textures: ['Charred & tender', 'Whipped & creamy', 'Crunchy (pine nuts)'],
    key_contrast: 'Heat and fruitiness of Aleppo oil against cool, tangy labneh',
  },
  presentation: 'The cauliflower arrives whole — dark and aromatic. Guests cut into it themselves, pulling the charred exterior through the labneh beneath. No tableside moment needed; the contrast does the work.',
  why_it_could_win: 'The vegetable main gap is real. A whole-roasted format at $19–22 creates visual impact without requiring premium protein. The Aleppo oil gives it a distinctly Salted Olive signature guests will ask about.',
  feasibility: {
    assets_leveraged: ['House Labneh', 'Aleppo Oil'],
    watchouts: ['Cauliflower size inconsistency affects roasting time', 'Test labneh separation at room temp for takeaway'],
  },
  experiment_focus: [
    'Does the whole-cauliflower format feel generous enough as a solo main at $20?',
    'Is the Aleppo oil distinctive enough that guests notice and ask about it?',
    'Does the dish read as Mediterranean-specific, not generic roasted veg?',
  ],
  status: 'draft',
})

interface Props {
  briefId: string
  label: string
  variant: 'primary' | 'ghost'
}

export function GenerateConceptButton({ briefId, label, variant }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleGenerate = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('rd_concepts')
      .insert(mockConcept(briefId))
      .select('id')
      .single()

    if (error || !data) {
      toast.error(error?.message ?? 'Failed to generate concept')
      setLoading(false)
      return
    }

    router.push(`/concepts/${data.id}`)
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className={cn(
        'flex items-center gap-2',
        variant === 'primary' ? primaryBtnCls : ghostBtnCls
      )}
    >
      <Sparkles size={14} />
      {loading ? 'Generating…' : label}
    </button>
  )
}
