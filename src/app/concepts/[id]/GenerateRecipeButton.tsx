'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import { primaryBtnCls } from '@/lib/styles'

interface Props {
  conceptId: string
  onSuccess: () => void
}

export function GenerateRecipeButton({ conceptId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Generation failed')
        return
      }
      onSuccess()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className={`flex items-center gap-2 ${primaryBtnCls}`}
    >
      <Sparkles size={14} />
      {loading ? 'Generating…' : 'Generate Recipe'}
    </button>
  )
}
