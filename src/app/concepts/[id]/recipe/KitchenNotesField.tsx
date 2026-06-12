'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { primaryBtnCls } from '@/lib/styles'

interface Props {
  recipeId: string
  initialValue: string
}

export function KitchenNotesField({ recipeId, initialValue }: Props) {
  const [value, setValue] = useState(initialValue)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('rd_recipes')
      .update({ test_kitchen_notes: value, status: value.trim() ? 'tested' : 'draft' })
      .eq('id', recipeId)

    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        placeholder="e.g. Cauliflower needs longer — 45 min at 220°C. Labneh too thick, add more olive oil. Pine nuts got lost, increase to 20g. Overall direction is right."
        className="bg-white border-olive/20 rounded-md text-sm text-ink font-light placeholder:text-ink-muted focus-visible:ring-olive focus-visible:border-olive resize-none"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={primaryBtnCls}
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save notes'}
        </button>
      </div>
    </div>
  )
}
