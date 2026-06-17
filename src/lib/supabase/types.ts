export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type IdentityPrinciple = {
  id: string
  name: string
  category: string | null
  definition: string | null
  question: string | null
  examples: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type StrategicRole = {
  id: string
  name: string
  definition: string | null
  characteristics: string | null
  success_indicator: string | null
  created_at: string
  updated_at: string
}

export type MenuCategory = {
  id: string
  name: string
  created_at: string
}

export type IngredientCategory = {
  id: string
  name: string
  examples: string | null
  created_at: string
}

export type ExperienceDimension = {
  id: string
  name: string
  definition: string | null
  low_end_description: string | null
  high_end_description: string | null
  low_examples: string | null
  high_examples: string | null
  scoring_guideline: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type FlavorIdentity = {
  id: string
  name: string
  created_at: string
}

export type TextureIdentity = {
  id: string
  name: string
  created_at: string
}

export type PantryExpressionType = {
  id: string
  name: string
  definition: string | null
  example: string | null
  created_at: string
}

export type MenuItem = {
  id: string
  name: string
  description: string | null
  category: string | null
  status: 'active' | 'inactive' | 'concept' | 'inspiration'
  hero_component: string | null
  primary_flavor_identity: string | null
  secondary_flavor_identities: string[]
  strategic_roles: string[]
  notes: string | null
  format_familiarity: number | null
  flavor_discovery: number | null
  created_at: string
  updated_at: string
}

export type CollectionDishSlot = {
  wave?: number
  wave_order?: number
  category: string
  concept_name: string
  one_line: string
}

export type CollectionWave = {
  wave: number
  feel: string
  categories: string[]
  dish_count: number
}

export type CollectionOutputData = {
  type: 'collection'
  collection_name: string
  tensions: string
  narrative: string
  collection_format: 'a_la_carte' | 'set_menu'
  waves?: CollectionWave[]
  dishes: CollectionDishSlot[]
}

export type RdBrief = {
  id: string
  brief_type: 'dish' | 'menu_collection'
  category: string | null
  menu_theme: string | null
  menu_composition: Record<string, number> | null
  ai_recommend_composition: boolean
  collection_format: 'a_la_carte' | 'set_menu'
  strategic_roles: string[]
  format_familiarity: number | null
  flavor_discovery: number | null
  pantry_assets: string[]
  opportunity: string | null
  creative_references: string | null
  desired_feeling: string | null
  constraints: string | null
  exploration_mode: 'safe' | 'balanced' | 'exploratory'
  generation_mode: 'full' | 'fast'
  output_data: CollectionOutputData | {
    narrative?: string
    recommendation?: string
    collection_name?: string
  } | null
  created_at: string
  updated_at: string
}

export type RdConcept = {
  id: string
  brief_id: string
  concept_name: string
  one_line: string | null
  breakdown: {
    hero: string
    flavor_drivers: string[]
    textures: string[]
    key_contrast: string
  } | null
  presentation: string | null
  why_it_could_win: {
    menu_gap: string
    emotional_trigger: string
    salted_olive: string
  } | null
  feasibility: {
    assets_leveraged: string[]
    watchouts: string[]
  } | null
  experiment_focus: string[]
  status: 'generated' | 'saved' | 'testing' | 'active' | 'archived'
  created_at: string
  updated_at: string
}

export type MenuItemPantryLink = {
  menu_item_id: string
  pantry_item_id: string
  created_at: string
}

export type PantryFlavorContribution = {
  id: string
  name: string
  created_at: string
}

export type PantryItem = {
  id: string
  name: string
  status: 'active' | 'inactive' | 'concept' | 'inspiration'
  category: string | null
  description: string | null
  flavor_contributions: string[]
  best_pairings: string[] | null
  cautions: string | null
  example_applications: string[] | null
  notes: string | null
  created_at: string
  updated_at: string
}

