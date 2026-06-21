<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# UI Rules — Read before touching any UI

## 1. Always use the design system

Before writing any JSX, read `COMPONENTS.md`. It defines every shared component and token.

**The rule: if a pattern is in `COMPONENTS.md`, use it. Never redefine it locally.**

Checklist before writing UI code:
- [ ] Layout wrapper → `PageHeader`, `BackLink`
- [ ] Content sections → `SectionCard`, `SectionLabel`
- [ ] Tags / badges → `Pill`, `StatusBadge`
- [ ] Form fields → `Field`, `inputCls` / `catalogueInputCls`, `textareaCls` from `src/lib/styles.ts`
- [ ] Single-select pills → `PillSelect`
- [ ] Multi-select pills → `MultiSelect`
- [ ] Scores → `ScoreSlider`
- [ ] Inline delete (page headers) → `DeleteButton`
- [ ] Buttons — pick by context + role (all exports from `src/lib/styles.ts`):
  - Page header / inline → `mutedBtnCls` (Edit), `destructiveBtnCls` (Delete)
  - Form footer row → `outlinedBtnCls` (Cancel), `outlinedDestructiveBtnCls` (Delete), `primaryBtnCls` (Save)
  - Forward / secondary → `ghostBtnCls`
  - Never write raw button classes. Never use `red-500` or `red-600`.
- [ ] Color tokens → only use Tailwind classes that map to `@theme {}` tokens in `globals.css`. Never hardcode hex values.

## 2. New components require approval before building

If something genuinely doesn't exist in `COMPONENTS.md`, **do not build it immediately**.

Instead:
1. Describe what it needs to do and where it will be used
2. Propose the component API (`props`, variants) and visual design in words
3. Wait for the user to confirm before writing any code
4. Once confirmed, build it **and** add it to `COMPONENTS.md`

This keeps the design system intentional — not a graveyard of one-off components.

## 3. Keep the component library page in sync

`/tools/components` (`src/app/tools/components/page.tsx`) is the **live visual reference** for the design system. It must stay in sync with `COMPONENTS.md`.

**The rule: any time a component is added or changed, update both files in the same session.**

Checklist at the end of any session where UI components were built or modified:
- [ ] Is the new component documented in `COMPONENTS.md`?
- [ ] Is it rendered with realistic mock data in `src/app/tools/components/page.tsx`?
- [ ] If an existing component's props or behaviour changed, is the library page updated too?

For analytics components (`src/app/analytics/`): import directly into the library page with static mock data — do not connect to Supabase. The mock data should reflect realistic values (real dish names, real order-of-magnitude numbers) so the visual output is meaningful, not placeholder Lorem Ipsum.
