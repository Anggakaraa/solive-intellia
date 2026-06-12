'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { mutedBtnCls, destructiveBtnCls } from '@/lib/styles'

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
          className={destructiveBtnCls}
        >
          {deleting ? 'Deleting…' : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className={mutedBtnCls}
        >
          Cancel
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className={destructiveBtnCls}
    >
      {label}
    </button>
  )
}
