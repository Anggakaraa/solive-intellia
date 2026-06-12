import { ExportButtons } from './export-buttons'

export default function ExportPage() {
  return (
    <div>
      <div className="mb-9">
        <p className="text-[10px] uppercase tracking-[2px] text-ink-muted mb-1.5">Tools</p>
        <h1 className="font-serif text-3xl font-normal text-ink tracking-tight leading-tight">
          Export
        </h1>
        <p className="text-sm text-ink-mid font-light mt-1.5">
          Download your catalogue data.
        </p>
      </div>
      <ExportButtons />
    </div>
  )
}
