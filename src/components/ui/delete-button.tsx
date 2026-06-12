'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  table: 'rd_briefs' | 'rd_concepts' | 'rd_recipes'
  id: string
  redirectTo: string
  label?: string
}

export function DeleteButton({ table, id, redirectTo, label = 'Delete' }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) {
      toast.error(error.message)
      setDeleting(false)
      setConfirming(false)
      return
    }
    router.push(redirectTo)
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-3 text-sm">
        <span className="text-ink-muted font-light">Are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-500 font-medium hover:text-red-600 transition-colors disabled:opacity-60"
        >
          {deleting ? 'Deleting…' : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-ink-muted hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-ink-muted hover:text-red-500 transition-colors"
    >
      {label}
    </button>
  )
}
