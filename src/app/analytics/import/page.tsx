import { createClient } from '@/lib/supabase/server'
import { BackLink } from '@/components/ui/back-link'
import { PageHeader } from '@/components/ui/page-header'
import { ImportForm } from './ImportForm'

export default async function ImportSalesPage() {
  const supabase = await createClient()

  const [{ data: menuItems }, { data: aliases }] = await Promise.all([
    supabase.from('menu_items').select('id, name').neq('status', 'inactive').order('name'),
    supabase.from('menu_item_aliases').select('alias_name, menu_item_id'),
  ])

  return (
    <div className="max-w-2xl">
      <BackLink href="/analytics" label="Performance" />

      <PageHeader
        eyebrow="Analytics"
        title="Import Sales Data"
        subtitle="Upload a CSV export from your POS system."
      />

      <ImportForm
        menuItems={menuItems ?? []}
        aliases={aliases ?? []}
      />
    </div>
  )
}
