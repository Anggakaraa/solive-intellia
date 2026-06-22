import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { SurveyFlow, type SurveyDish } from './SurveyFlow'

export default async function FFDSurveyPage() {
  const supabase = await createClient()

  const [{ data: menuItems }, { data: concepts }] = await Promise.all([
    supabase
      .from('menu_items')
      .select('id, name, category, primary_flavor_identity, secondary_flavor_identities, format_familiarity, flavor_discovery, ff_fd_surveyed_at, status')
      .in('status', ['active', 'concept'])
      .order('name'),
    supabase
      .from('rd_concepts')
      .select('id, concept_name, format_familiarity, flavor_discovery, ff_fd_surveyed_at, status')
      .in('status', ['saved', 'testing', 'active'])
      .order('concept_name'),
  ])

  const menuDishes: SurveyDish[] = (menuItems ?? []).map((m) => ({
    id:              m.id,
    name:            m.name,
    category:        m.category ?? null,
    sourceType:      'menu_item',
    primaryFlavor:   m.primary_flavor_identity ?? null,
    secondaryFlavors: m.secondary_flavor_identities ?? [],
    existingFF:      m.format_familiarity ?? null,
    existingFD:      m.flavor_discovery   ?? null,
    alreadySurveyed: !!m.ff_fd_surveyed_at,
  }))

  const conceptDishes: SurveyDish[] = (concepts ?? []).map((c) => ({
    id:              c.id,
    name:            c.concept_name,
    category:        null,
    sourceType:      'rd_concept',
    primaryFlavor:   null,
    secondaryFlavors: [],
    existingFF:      c.format_familiarity ?? null,
    existingFD:      c.flavor_discovery   ?? null,
    alreadySurveyed: !!c.ff_fd_surveyed_at,
  }))

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Tools"
        title="FF / FD Survey"
        subtitle="Score dishes on Format Familiarity and Flavor Discovery for consistent menu intelligence."
      />
      <SurveyFlow menuItems={menuDishes} savedConcepts={conceptDishes} />
    </div>
  )
}
