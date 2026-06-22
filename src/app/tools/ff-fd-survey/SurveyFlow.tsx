'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle } from 'lucide-react'
import { SectionCard } from '@/components/ui/section-card'
import { primaryBtnCls, mutedBtnCls } from '@/lib/styles'
import { applyFFDScores, type SurveyResultPayload } from './actions'

// ── Types ──────────────────────────────────────────────────────────────────────

export type SurveyDish = {
  id: string
  name: string
  category: string | null
  sourceType: 'menu_item' | 'rd_concept'
  primaryFlavor: string | null
  secondaryFlavors: string[]
  existingFF: number | null
  existingFD: number | null
  alreadySurveyed: boolean
}

type Answers = {
  formatRecognition:      number | null
  orderingConfidence:     number | null
  eatingFamiliarity:      number | null
  flavorFamiliarityManual: number | null  // rd_concepts only
  ingredientFamiliarity:  number | null
  combinationNovelty:     number | null
}

type Phase = 'selecting' | 'surveying' | 'reviewing' | 'done'

// ── Scoring constants ──────────────────────────────────────────────────────────

const FLAVOR_FAMILIARITY: Record<string, number> = {
  Savory: 5, Sweet: 5, Spicy: 5, Umami: 5,
  Rich: 4, Creamy: 4,
  Tangy: 3, Smoky: 3, Fresh: 3,
  Nutty: 2, Herbaceous: 2, Earthy: 2, Briny: 2,
  Floral: 1, Bitter: 1,
}

function calcFlavorFamiliarityAuto(primary: string | null, secondary: string[]): number | null {
  const all = [primary, ...secondary].filter(Boolean) as string[]
  if (all.length === 0) return null
  const scores = all.map((f) => FLAVOR_FAMILIARITY[f] ?? 3)
  return +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
}

function rawToScore(raw: number): number {
  if (raw >= 4.5) return 5
  if (raw >= 3.5) return 4
  if (raw >= 2.5) return 3
  if (raw >= 1.5) return 2
  return 1
}

function calcScores(answers: Answers, flavorAuto: number | null) {
  const { formatRecognition, orderingConfidence, eatingFamiliarity,
          flavorFamiliarityManual, ingredientFamiliarity, combinationNovelty } = answers

  const flavorFamiliarityAuto = flavorAuto ?? flavorFamiliarityManual

  const ffInputs = [formatRecognition, orderingConfidence, eatingFamiliarity]
  const fdInputs = [flavorFamiliarityAuto, ingredientFamiliarity, combinationNovelty]

  const ffReady = ffInputs.every((v) => v !== null)
  const fdReady = fdInputs.every((v) => v !== null)

  if (!ffReady || !fdReady) return null

  const ffRaw = (ffInputs as number[]).reduce((a, b) => a + b, 0) / 3

  const flavorDiscovery      = 6 - (flavorFamiliarityAuto as number)
  const ingredientDiscovery  = 6 - (ingredientFamiliarity as number)
  const combinationDiscovery = 6 - (combinationNovelty    as number)
  const fdRaw = (flavorDiscovery + ingredientDiscovery + combinationDiscovery) / 3

  return {
    ffRaw: +ffRaw.toFixed(2),
    fdRaw: +fdRaw.toFixed(2),
    ff: rawToScore(ffRaw),
    fd: rawToScore(fdRaw),
    flavorDiscovery: +flavorDiscovery.toFixed(2),
    ingredientDiscovery,
    combinationDiscovery,
    flavorFamiliarityAuto: +(flavorFamiliarityAuto as number).toFixed(2),
  }
}

// ── Question definitions ───────────────────────────────────────────────────────

const FF_QUESTIONS: { key: keyof Answers; label: string; question: string; descriptions: Record<number, string> }[] = [
  {
    key: 'formatRecognition',
    label: 'Format Recognition',
    question: 'How commonly would the average Jakarta diner encounter this dish format?',
    descriptions: {
      5: 'Extremely common. Found in many restaurants. Examples: Steak, Roast Chicken, Fries.',
      4: 'Common. Most diners have likely encountered something similar.',
      3: 'Moderately familiar. Recognizable but not mainstream.',
      2: 'Uncommon. Many diners may not have encountered it.',
      1: 'Rare or unfamiliar. Most diners have little reference point.',
    },
  },
  {
    key: 'orderingConfidence',
    label: 'Ordering Confidence',
    question: 'How confidently could a guest order this without asking questions?',
    descriptions: {
      5: 'No explanation needed.',
      4: 'Name mostly explains itself.',
      3: 'Some guests will ask questions.',
      2: 'Often requires staff explanation.',
      1: 'Difficult to understand without storytelling.',
    },
  },
  {
    key: 'eatingFamiliarity',
    label: 'Eating Familiarity',
    question: 'How obvious is the eating experience?',
    descriptions: {
      5: 'Guests immediately know how to eat it.',
      4: 'Minor ambiguity.',
      3: 'Some uncertainty.',
      2: 'Requires explanation.',
      1: 'Novel interaction or eating method.',
    },
  },
]

const FLAVOR_FAMILIARITY_QUESTION = {
  key: 'flavorFamiliarityManual' as keyof Answers,
  label: 'Flavor Familiarity',
  question: 'How familiar are the primary flavors to the average Jakarta diner?',
  note: 'This is auto-calculated for menu items with flavor tags. Enter manually for concepts without flavor data.',
  descriptions: {
    5: 'Everyday familiar — Savory, Sweet, Spicy, Umami.',
    4: 'Common restaurant flavors — Rich, Creamy.',
    3: 'Somewhat familiar — Tangy, Smoky, Fresh.',
    2: 'Less common — Nutty, Herbaceous, Earthy, Briny.',
    1: 'Adventurous — Floral, Bitter.',
  },
}

const FD_QUESTIONS: { key: keyof Answers; label: string; question: string; note?: string; descriptions: Record<number, string> }[] = [
  {
    key: 'ingredientFamiliarity',
    label: 'Ingredient Familiarity',
    question: 'How familiar are the core ingredients to the average Jakarta diner?',
    note: 'Evaluate only the hero and defining ingredients — not every item in the recipe.',
    descriptions: {
      5: 'Common everyday ingredients.',
      4: 'Familiar restaurant ingredients.',
      3: 'Some ingredients may be unfamiliar.',
      2: 'Multiple uncommon ingredients.',
      1: 'Most diners would not recognize many ingredients.',
    },
  },
  {
    key: 'combinationNovelty',
    label: 'Combination Novelty',
    question: 'How unusual is the combination of flavors and ingredients?',
    descriptions: {
      5: 'Very common pairing. Example: Steak + Fries.',
      4: 'Familiar pairing with small twist. Example: Lamb + Herb Yoghurt.',
      3: 'Moderately unexpected. Example: Cauliflower + Muhammara.',
      2: 'Distinctly unusual. Example: Fish + Amba.',
      1: 'Highly unexpected combination. Example: Watermelon + Nduja.',
    },
  },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function ScoreButton({ value, selected, onSelect }: {
  value: number; selected: boolean; onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={[
        'w-10 h-10 rounded-full text-sm font-medium transition-all border',
        selected
          ? 'bg-olive text-cream border-olive'
          : 'bg-white text-ink-muted border-olive/20 hover:border-olive/50 hover:text-ink',
      ].join(' ')}
    >
      {value}
    </button>
  )
}

function SurveyQuestion({ question: q, value, onChange }: {
  question: typeof FF_QUESTIONS[0]
  value: number | null
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const display = hovered ?? value

  return (
    <div className="mb-6">
      <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-1">{q.label}</p>
      <p className="text-sm text-ink font-light mb-3">{q.question}</p>
      {('note' in q) && typeof (q as { note?: string }).note === 'string' && (
        <p className="text-[11px] text-ink-muted font-light mb-3 italic">{(q as { note: string }).note}</p>
      )}
      <div className="flex gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <div
            key={v}
            onMouseEnter={() => setHovered(v)}
            onMouseLeave={() => setHovered(null)}
          >
            <ScoreButton value={v} selected={value === v} onSelect={() => onChange(v)} />
          </div>
        ))}
      </div>
      <p className="text-[11px] text-ink-muted font-light min-h-[18px]">
        {display ? q.descriptions[display] : ''}
      </p>
    </div>
  )
}

function ScorePreview({ answers, flavorAuto }: { answers: Answers; flavorAuto: number | null }) {
  const scores = calcScores(answers, flavorAuto)

  function SubRow({ label, value }: { label: string; value: number | null }) {
    return (
      <div className="flex justify-between items-center py-1 border-b border-olive/8 last:border-0">
        <span className="text-[11px] text-ink-muted font-light">{label}</span>
        <span className={['text-[11px] font-medium tabular-nums', value !== null ? 'text-ink' : 'text-ink-muted/40'].join(' ')}>
          {value !== null ? value : '—'}
        </span>
      </div>
    )
  }

  return (
    <SectionCard variant="muted">
      <div className="flex gap-6 mb-4">
        <div className="flex-1 text-center">
          <p className="text-[9px] uppercase tracking-[1.5px] text-ink-muted mb-1">FF</p>
          <p className="font-serif text-3xl text-ink">{scores?.ff ?? '?'}</p>
        </div>
        <div className="w-px bg-olive/15" />
        <div className="flex-1 text-center">
          <p className="text-[9px] uppercase tracking-[1.5px] text-ink-muted mb-1">FD</p>
          <p className="font-serif text-3xl text-ink">{scores?.fd ?? '?'}</p>
        </div>
      </div>
      <div className="space-y-0">
        <p className="text-[9px] uppercase tracking-[1.2px] text-ink-muted mb-1">Format Familiarity</p>
        <SubRow label="Format Recognition"   value={answers.formatRecognition} />
        <SubRow label="Ordering Confidence"  value={answers.orderingConfidence} />
        <SubRow label="Eating Familiarity"   value={answers.eatingFamiliarity} />
        <p className="text-[9px] uppercase tracking-[1.2px] text-ink-muted mt-3 mb-1">Flavor Discovery</p>
        <SubRow label="Flavor Discovery (auto)" value={scores ? +scores.flavorDiscovery.toFixed(1) : null} />
        <SubRow label="Ingredient Discovery"    value={scores ? scores.ingredientDiscovery : null} />
        <SubRow label="Combination Discovery"   value={scores ? scores.combinationDiscovery : null} />
      </div>
    </SectionCard>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function SurveyFlow({
  menuItems,
  savedConcepts,
}: {
  menuItems: SurveyDish[]
  savedConcepts: SurveyDish[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [phase, setPhase]             = useState<Phase>('selecting')
  const [selected, setSelected]       = useState<Set<string>>(new Set())
  const [queue, setQueue]             = useState<SurveyDish[]>([])
  const [currentIdx, setCurrentIdx]   = useState(0)
  const [allAnswers, setAllAnswers]    = useState<Record<string, Answers>>({})

  const emptyAnswers = (): Answers => ({
    formatRecognition: null, orderingConfidence: null, eatingFamiliarity: null,
    flavorFamiliarityManual: null, ingredientFamiliarity: null, combinationNovelty: null,
  })

  // ── Selection phase ────────────────────────────────────────────────────────

  function toggleDish(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function startSurvey() {
    const all = [...menuItems, ...savedConcepts]
    const q = all.filter((d) => selected.has(d.id))
    const initialAnswers: Record<string, Answers> = {}
    q.forEach((d) => { initialAnswers[d.id] = emptyAnswers() })
    setQueue(q)
    setAllAnswers(initialAnswers)
    setCurrentIdx(0)
    setPhase('surveying')
  }

  // ── Survey phase ───────────────────────────────────────────────────────────

  const currentDish = queue[currentIdx]

  function setAnswer(dishId: string, key: keyof Answers, value: number) {
    setAllAnswers((prev) => ({
      ...prev,
      [dishId]: { ...prev[dishId], [key]: value },
    }))
  }

  function currentAnswersComplete(): boolean {
    if (!currentDish) return false
    const a = allAnswers[currentDish.id]
    if (!a) return false
    const flavorAuto = calcFlavorFamiliarityAuto(currentDish.primaryFlavor, currentDish.secondaryFlavors)
    const needManualFlavor = flavorAuto === null
    return (
      a.formatRecognition !== null &&
      a.orderingConfidence !== null &&
      a.eatingFamiliarity !== null &&
      a.ingredientFamiliarity !== null &&
      a.combinationNovelty !== null &&
      (!needManualFlavor || a.flavorFamiliarityManual !== null)
    )
  }

  function advanceOrReview() {
    if (currentIdx < queue.length - 1) {
      setCurrentIdx((i) => i + 1)
    } else {
      setPhase('reviewing')
    }
  }

  // ── Compute final results ─────────────────────────────────────────────────

  function buildResults(): SurveyResultPayload[] {
    return queue.map((dish) => {
      const a = allAnswers[dish.id]
      const flavorAuto = calcFlavorFamiliarityAuto(dish.primaryFlavor, dish.secondaryFlavors)
      const scores = calcScores(a, flavorAuto)!
      return {
        dishId:                 dish.id,
        sourceType:             dish.sourceType,
        formatRecognition:      a.formatRecognition!,
        orderingConfidence:     a.orderingConfidence!,
        eatingFamiliarity:      a.eatingFamiliarity!,
        flavorFamiliarityAuto:  scores.flavorFamiliarityAuto,
        ingredientFamiliarity:  a.ingredientFamiliarity!,
        combinationNovelty:     a.combinationNovelty!,
        ffRaw:                  scores.ffRaw,
        fdRaw:                  scores.fdRaw,
        ff:                     scores.ff,
        fd:                     scores.fd,
      }
    })
  }

  function apply() {
    const results = buildResults()
    startTransition(async () => {
      await applyFFDScores(results)
      setPhase('done')
    })
  }

  // ── Dish row (selection screen) ────────────────────────────────────────────

  function DishRow({ dish }: { dish: SurveyDish }) {
    const isSelected = selected.has(dish.id)
    return (
      <button
        onClick={() => toggleDish(dish.id)}
        className={[
          'w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors',
          isSelected
            ? 'border-olive/40 bg-olive-faint'
            : 'border-olive/12 bg-white hover:border-olive/25',
        ].join(' ')}
      >
        {isSelected
          ? <CheckCircle2 size={16} className="text-olive shrink-0" />
          : <Circle size={16} className="text-ink-muted/40 shrink-0" />
        }
        <div className="flex-1 min-w-0">
          <p className="text-sm text-ink truncate">{dish.name}</p>
          {dish.category && (
            <p className="text-[11px] text-ink-muted font-light">{dish.category}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {dish.alreadySurveyed && (
            <span className="text-[10px] bg-olive/10 text-olive px-2 py-0.5 rounded-full">
              scored
            </span>
          )}
          {dish.existingFF !== null && dish.existingFD !== null && (
            <span className="text-[11px] text-ink-muted tabular-nums">
              FF{dish.existingFF} · FD{dish.existingFD}
            </span>
          )}
        </div>
      </button>
    )
  }

  // ── Renders ────────────────────────────────────────────────────────────────

  if (phase === 'done') {
    return (
      <div className="text-center py-20">
        <p className="font-serif text-2xl text-ink mb-2">Scores applied.</p>
        <p className="text-sm text-ink-muted font-light mb-8">
          {queue.length} {queue.length === 1 ? 'dish' : 'dishes'} updated.
        </p>
        <div className="flex justify-center gap-3">
          <button className={mutedBtnCls} onClick={() => router.push('/menu-items')}>
            View Menu Items
          </button>
          <button className={primaryBtnCls} onClick={() => {
            setPhase('selecting'); setSelected(new Set()); setQueue([])
          }}>
            Score more dishes
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'selecting') {
    return (
      <div>
        <div className="grid grid-cols-1 gap-6">
          {menuItems.length > 0 && (
            <SectionCard label="Menu Items">
              <p className="text-[11px] text-ink-muted font-light -mt-1 mb-4">
                Active and concept dishes
              </p>
              <div className="space-y-1.5">
                {menuItems.map((d) => <DishRow key={d.id} dish={d} />)}
              </div>
            </SectionCard>
          )}

          {savedConcepts.length > 0 && (
            <SectionCard label="Saved Concepts">
              <p className="text-[11px] text-ink-muted font-light -mt-1 mb-4">
                R&D concepts saved from brief output
              </p>
              <div className="space-y-1.5">
                {savedConcepts.map((d) => <DishRow key={d.id} dish={d} />)}
              </div>
            </SectionCard>
          )}
        </div>

        {selected.size > 0 && (
          <div className="mt-6 flex justify-end">
            <button className={primaryBtnCls} onClick={startSurvey}>
              Start survey — {selected.size} {selected.size === 1 ? 'dish' : 'dishes'}
            </button>
          </div>
        )}
      </div>
    )
  }

  if (phase === 'surveying' && currentDish) {
    const answers    = allAnswers[currentDish.id]
    const flavorAuto = calcFlavorFamiliarityAuto(currentDish.primaryFlavor, currentDish.secondaryFlavors)
    const needManualFlavor = flavorAuto === null
    const complete   = currentAnswersComplete()

    return (
      <div>
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5">
            {queue.map((_, i) => (
              <div key={i} className={[
                'h-1.5 w-8 rounded-full',
                i < currentIdx ? 'bg-olive' : i === currentIdx ? 'bg-olive/60' : 'bg-olive/15',
              ].join(' ')} />
            ))}
          </div>
          <span className="text-[11px] text-ink-muted">
            {currentIdx + 1} of {queue.length}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_220px] gap-6 items-start">
          {/* Questions */}
          <div>
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-0.5">
                {currentDish.sourceType === 'menu_item' ? 'Menu Item' : 'Saved Concept'}
              </p>
              <p className="font-serif text-2xl text-ink">{currentDish.name}</p>
              {currentDish.existingFF !== null && currentDish.existingFD !== null && (
                <p className="text-[11px] text-ink-muted mt-1">
                  Current scores: FF{currentDish.existingFF} · FD{currentDish.existingFD}
                </p>
              )}
            </div>

            {/* Auto flavor block */}
            {flavorAuto !== null ? (
              <div className="mb-6 bg-olive-faint border border-olive/15 rounded-lg px-4 py-3">
                <p className="text-[10px] uppercase tracking-[1.5px] text-olive mb-1">
                  Flavor Familiarity — Auto
                </p>
                <p className="text-sm text-ink font-medium">{flavorAuto.toFixed(2)}</p>
                <p className="text-[11px] text-ink-muted font-light mt-0.5">
                  {[currentDish.primaryFlavor, ...currentDish.secondaryFlavors]
                    .filter(Boolean)
                    .map((f) => `${f} (${FLAVOR_FAMILIARITY[f!] ?? '?'})`)
                    .join(' · ')}
                </p>
                <p className="text-[11px] text-ink-muted font-light mt-1">
                  Flavor Discovery component = 6 − {flavorAuto.toFixed(2)} = {(6 - flavorAuto).toFixed(2)}
                </p>
              </div>
            ) : needManualFlavor ? (
              <SurveyQuestion
                question={FLAVOR_FAMILIARITY_QUESTION}
                value={answers.flavorFamiliarityManual}
                onChange={(v) => setAnswer(currentDish.id, 'flavorFamiliarityManual', v)}
              />
            ) : null}

            <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-4">
              Format Familiarity (FF)
            </p>
            {FF_QUESTIONS.map((q) => (
              <SurveyQuestion
                key={q.key}
                question={q}
                value={answers[q.key]}
                onChange={(v) => setAnswer(currentDish.id, q.key, v)}
              />
            ))}

            <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-4 mt-2">
              Flavor Discovery (FD)
            </p>
            {FD_QUESTIONS.map((q) => (
              <SurveyQuestion
                key={q.key}
                question={q}
                value={answers[q.key]}
                onChange={(v) => setAnswer(currentDish.id, q.key, v)}
              />
            ))}

            <div className="flex justify-end mt-4">
              <button
                className={primaryBtnCls}
                disabled={!complete}
                onClick={advanceOrReview}
              >
                {currentIdx < queue.length - 1 ? 'Next dish →' : 'Review all →'}
              </button>
            </div>
          </div>

          {/* Live score preview — sticky */}
          <div className="sticky top-6">
            <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-2">Live Score</p>
            <ScorePreview answers={answers} flavorAuto={flavorAuto} />
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'reviewing') {
    const results = buildResults()

    return (
      <div>
        <div className="mb-6">
          <p className="font-serif text-2xl text-ink mb-1">Review scores</p>
          <p className="text-sm text-ink-muted font-light">
            Confirm before writing back to dishes.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {results.map((r) => {
            const dish = queue.find((d) => d.id === r.dishId)!
            return (
              <SectionCard key={r.dishId}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{dish.name}</p>
                    {dish.existingFF !== null && (
                      <p className="text-[11px] text-ink-muted font-light">
                        Previous: FF{dish.existingFF} · FD{dish.existingFD}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-4 shrink-0">
                    <div className="text-center">
                      <p className="text-[9px] uppercase tracking-[1.5px] text-ink-muted">FF</p>
                      <p className="font-serif text-2xl text-ink">{r.ff}</p>
                      <p className="text-[10px] text-ink-muted">{r.ffRaw.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] uppercase tracking-[1.5px] text-ink-muted">FD</p>
                      <p className="font-serif text-2xl text-ink">{r.fd}</p>
                      <p className="text-[10px] text-ink-muted">{r.fdRaw.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-[11px]">
                  <div className="text-ink-muted">Format Recognition: <span className="text-ink">{r.formatRecognition}</span></div>
                  <div className="text-ink-muted">Flavor Familiarity (auto): <span className="text-ink">{r.flavorFamiliarityAuto}</span></div>
                  <div className="text-ink-muted">Ordering Confidence: <span className="text-ink">{r.orderingConfidence}</span></div>
                  <div className="text-ink-muted">Ingredient Familiarity: <span className="text-ink">{r.ingredientFamiliarity}</span></div>
                  <div className="text-ink-muted">Eating Familiarity: <span className="text-ink">{r.eatingFamiliarity}</span></div>
                  <div className="text-ink-muted">Combination Novelty: <span className="text-ink">{r.combinationNovelty}</span></div>
                </div>
              </SectionCard>
            )
          })}
        </div>

        <div className="flex justify-between items-center">
          <button className={mutedBtnCls} onClick={() => { setCurrentIdx(0); setPhase('surveying') }}>
            ← Back to survey
          </button>
          <button className={primaryBtnCls} onClick={apply} disabled={isPending}>
            {isPending ? 'Saving…' : `Apply ${results.length} ${results.length === 1 ? 'score' : 'scores'}`}
          </button>
        </div>
      </div>
    )
  }

  return null
}
