'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { primaryBtnCls, ghostBtnCls } from '@/lib/styles'

interface Props {
  briefId: string
  briefType: 'dish' | 'menu_collection'
  label: string
  variant: 'primary' | 'ghost'
}

export function GenerateConceptButton({ briefId, label, variant }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    setLoading(true)

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 120000)

      const res = await fetch('/api/generate-concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout))

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Unknown error' }))
        toast.error(error ?? 'Failed to generate concepts')
        return
      }

      router.push(`/brief/${briefId}/output`)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        toast.error('Generation timed out — try Fast mode or reduce the number of dishes')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
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
      <Sparkles size={14} className={loading ? 'animate-spin' : ''} />
      {loading ? 'Generating concepts…' : label}
    </button>
  )
}
