'use server'

import { createClient } from '@/lib/supabase/server'

export type SurveyResultPayload = {
  dishId: string
  sourceType: 'menu_item' | 'rd_concept'
  formatRecognition: number
  orderingConfidence: number
  eatingFamiliarity: number
  flavorFamiliarityAuto: number
  ingredientFamiliarity: number
  combinationNovelty: number
  ffRaw: number
  fdRaw: number
  ff: number
  fd: number
}

export async function applyFFDScores(results: SurveyResultPayload[]) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  for (const r of results) {
    await supabase.from('ff_fd_surveys').insert({
      source_type:             r.sourceType,
      menu_item_id:            r.sourceType === 'menu_item'  ? r.dishId : null,
      rd_concept_id:           r.sourceType === 'rd_concept' ? r.dishId : null,
      format_recognition:      r.formatRecognition,
      ordering_confidence:     r.orderingConfidence,
      eating_familiarity:      r.eatingFamiliarity,
      flavor_familiarity_auto: r.flavorFamiliarityAuto,
      ingredient_familiarity:  r.ingredientFamiliarity,
      combination_novelty:     r.combinationNovelty,
      ff_raw:                  r.ffRaw,
      fd_raw:                  r.fdRaw,
      ff:                      r.ff,
      fd:                      r.fd,
    })

    if (r.sourceType === 'menu_item') {
      await supabase.from('menu_items')
        .update({ format_familiarity: r.ff, flavor_discovery: r.fd, ff_fd_surveyed_at: now })
        .eq('id', r.dishId)
    } else {
      await supabase.from('rd_concepts')
        .update({ format_familiarity: r.ff, flavor_discovery: r.fd, ff_fd_surveyed_at: now })
        .eq('id', r.dishId)
    }
  }
}
