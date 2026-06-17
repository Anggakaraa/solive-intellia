'use client'

import { useState, useEffect } from 'react'
import { FolderOpen, FolderCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ghostBtnCls } from '@/lib/styles'
import { cn } from '@/lib/utils'

interface Props {
  briefId: string
  collectionName: string
  menuTheme: string | null
  conceptCount?: number
}

export function SaveCollectionButton({ briefId, collectionName, menuTheme, conceptCount = 0 }: Props) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('saved_collections')
        .select('id')
        .eq('brief_id', briefId)
        .maybeSingle()
      setSaved(!!data)
      setChecking(false)
    }
    check()
  }, [briefId])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('saved_collections')
      .insert({ name: collectionName, brief_id: briefId, menu_theme: menuTheme, status: 'saved' })

    if (error) {
      toast.error('Failed to save collection')
    } else {
      toast.success('Collection saved')
      setSaved(true)
    }
    setSaving(false)
  }

  if (checking) return null

  return (
    <button
      onClick={handleSave}
      disabled={saved || saving}
      className={cn('flex items-center gap-1.5 disabled:opacity-50', ghostBtnCls)}
    >
      {saved ? <FolderCheck size={13} /> : <FolderOpen size={13} />}
      {saving
        ? 'Saving…'
        : saved
        ? 'Saved to collections'
        : conceptCount > 0
        ? `Save Collection · ${conceptCount} dish${conceptCount !== 1 ? 'es' : ''} developed`
        : 'Save Collection'}
    </button>
  )
}
