import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/ui/page-header'
import { SimpleListEditor } from './simple-list-editor'
import { StrategicRolesEditor } from './strategic-roles-editor'

export default async function ReferencePage() {
  const supabase = await createClient()

  const [
    { data: roles },
    { data: flavors },
    { data: categories },
    { data: pantryFlavors },
  ] = await Promise.all([
    supabase.from('strategic_roles').select('*').order('name'),
    supabase.from('flavor_identities').select('*').order('name'),
    supabase.from('menu_categories').select('*').order('name'),
    supabase.from('pantry_flavor_contributions').select('*').order('name'),
  ])

  return (
    <div>
      <PageHeader
        eyebrow="Knowledge"
        title="Reference Data"
        subtitle="Manage the data tags used when entering menu and pantry items."
      />

      <Tabs defaultValue="roles">
        <TabsList className="flex gap-0 bg-transparent border-b border-olive/15 rounded-none h-auto mb-8 p-0 w-full">
          {[
            { value: 'roles', label: 'Strategic Roles' },
            { value: 'flavors', label: 'Menu Flavors' },
            { value: 'pantry-flavors', label: 'Pantry Flavors' },
            { value: 'categories', label: 'Menu Categories' },
          ].map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-none text-sm text-ink-muted border-b-2 border-transparent px-4 py-2.5 data-[state=active]:text-ink data-[state=active]:border-olive data-[state=active]:font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="roles">
          <StrategicRolesEditor roles={roles ?? []} />
        </TabsContent>
        <TabsContent value="flavors">
          <SimpleListEditor table="flavor_identities" items={flavors ?? []} label="Flavor Identity" />
        </TabsContent>
        <TabsContent value="pantry-flavors">
          <SimpleListEditor table="pantry_flavor_contributions" items={pantryFlavors ?? []} label="Pantry Flavor" />
        </TabsContent>
        <TabsContent value="categories">
          <SimpleListEditor table="menu_categories" items={categories ?? []} label="Menu Category" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
