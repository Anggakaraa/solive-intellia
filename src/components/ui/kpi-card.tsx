interface KpiCardProps {
  label: string
  value: string
  note?: string
}

export function KpiCard({ label, value, note }: KpiCardProps) {
  return (
    <div className="bg-white border border-olive/15 rounded-lg p-5">
      <p className="text-[10px] uppercase tracking-[1.5px] text-ink-muted mb-2">{label}</p>
      <p className="font-serif text-2xl text-ink">{value}</p>
      {note && <p className="text-[11px] text-ink-muted font-light mt-1.5">{note}</p>}
    </div>
  )
}
