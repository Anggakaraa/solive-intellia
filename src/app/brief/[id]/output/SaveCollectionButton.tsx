'use client'

import { useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ghostBtnCls } from '@/lib/styles'
import { cn } from '@/lib/utils'

interface Props {
  briefId: string
  collectionName: string
  menuTheme: string | null
  conceptIds: string[]
}

export function SaveCollectionButton({ briefId, collectionName, menuTheme, conceptIds }: Props) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    const { data: collection, error } = await supabase
      .from('saved_collections')
      .insert({ name: collectionName, brief_id: briefId, menu_theme: menuTheme, status: 'saved' })
      .select('id')
      .single()

    if (error || !collection) {
      toast.error('Failed to save collection')
      setSaving(false)
      return
    }

    const links = conceptIds.map((conceptId, i) => ({
      collection_id: collection.id,
      concept_id: conceptId,
      wave: 1,
      wave_order: i + 1,
    }))

    const { error: linkError } = await supabase
      .from('saved_collection_concepts')
      .insert(links)

    if (linkError) {
      toast.error('Collection saved but dish links failed')
    } else {
      toast.success('Collection saved')
      setSaved(true)
    }

    setSaving(false)
  }

  return (
    <button
      onClick={handleSave}
      disabled={saved || saving}
      className={cn('flex items-center gap-1.5 disabled:opacity-50', ghostBtnCls)}
    >
      <FolderOpen size={13} />
      {saving ? 'Saving…' : saved ? 'Collection Saved' : 'Save Collection'}
    </button>
  )
}
