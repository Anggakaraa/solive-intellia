/**
 * Shared Tailwind class strings for form elements.
 * Use these instead of redefining in each file.
 *
 * inputCls           — white background; for R&D / intelligence forms
 * catalogueInputCls  — cream-dark background; for catalogue forms (menu-items, pantry-items, reference)
 */

export const inputCls =
  'w-full bg-white border border-olive/20 rounded-md text-sm text-ink font-light px-3 py-2 placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-olive focus:border-olive disabled:opacity-50 disabled:cursor-not-allowed'

export const textareaCls =
  'bg-white border-olive/20 rounded-md text-sm text-ink font-light placeholder:text-ink-muted focus-visible:ring-olive focus-visible:border-olive resize-none'

export const selectCls = inputCls

/** Used in catalogue forms that sit on a cream-dark background */
export const catalogueInputCls =
  'bg-cream-dark border-olive/20 rounded-md text-sm text-ink font-light placeholder:text-ink-muted focus-visible:ring-olive focus-visible:border-olive'

// ─── Button variants ───────────────────────────────────────────────────────────
// Apply to <button> or <Link>. Role determines variant — not location or page.
//
// primary      → constructive commit: Save, Add, Generate, Capture
// ghost        → secondary forward action: View, Generate another, Save notes
// muted        → neutral/available action: Edit, Cancel
// destructive  → irreversible: Delete, Confirm delete

export const primaryBtnCls =
  'bg-olive text-cream text-sm font-medium px-5 py-2.5 rounded-md hover:bg-olive-light transition-colors disabled:opacity-60'

export const ghostBtnCls =
  'text-olive text-sm font-medium hover:text-olive-light transition-colors disabled:opacity-60'

/** Inline context — Edit/Cancel sitting alongside content (page headers, confirmations) */
export const mutedBtnCls =
  'text-ink-muted text-sm hover:text-ink transition-colors'

/** Inline context — Delete sitting alongside content (page headers) */
export const destructiveBtnCls =
  'text-ink-muted text-sm hover:text-pimento transition-colors disabled:opacity-60'

/** Form footer context — Cancel in a row alongside other buttons */
export const outlinedBtnCls =
  'border border-olive/30 text-ink-mid text-sm font-medium px-5 py-2.5 rounded-md bg-transparent hover:border-olive/60 hover:text-ink transition-colors disabled:opacity-60'

/** Form footer context — Delete in a row alongside other buttons */
export const outlinedDestructiveBtnCls =
  'border border-pimento/30 text-pimento text-sm font-medium px-5 py-2.5 rounded-md bg-transparent hover:bg-pimento/5 transition-colors disabled:opacity-60'
