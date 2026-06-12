/**
 * Lifecycle status badge for rd_concepts, rd_recipes, menu items, pantry items.
 * All status → colour mappings live here — never hardcode in pages.
 */

const styles: Record<string, string> = {
  // Concept statuses
  draft:            'bg-cream-dark text-ink-muted',
  saved:            'bg-olive-faint text-olive',
  recipe_generated: 'bg-olive-faint text-olive',
  kitchen_tested:   'bg-[#EAF3DE] text-[#3B6D11]',
  validated:        'bg-[#EAF3DE] text-[#3B6D11]',
  // Recipe statuses
  tested:           'bg-[#EAF3DE] text-[#3B6D11]',
  revised:          'bg-[#FAEEDA] text-[#854F0B]',
  approved:         'bg-[#EAF3DE] text-[#3B6D11]',
  // Menu / pantry item statuses
  active:           'bg-[#EAF3DE] text-[#3B6D11]',
  concept:          'bg-[#FAEEDA] text-[#854F0B]',
  inspiration:      'bg-[#EAE8F5] text-[#4A3F82]',
  inactive:         'bg-[#F1EFE8] text-[#5F5E5A]',
  // Generic
  pending:          'bg-cream-dark text-ink-muted',
}

const labels: Record<string, string> = {
  draft:            'Draft',
  saved:            'Saved',
  recipe_generated: 'Recipe ready',
  kitchen_tested:   'Kitchen tested',
  validated:        'Validated',
  tested:           'Tested',
  revised:          'Revised',
  approved:         'Approved',
  active:           'Active',
  concept:          'Concept',
  inspiration:      'Inspiration',
  inactive:         'Inactive',
  pending:          'Pending',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const cls = styles[status] ?? styles.draft
  const label = labels[status] ?? status
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${cls} ${className}`}
    >
      {label}
    </span>
  )
}
