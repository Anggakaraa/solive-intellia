import { PageHeader } from '@/components/ui/page-header'
import { ExportButtons } from './export-buttons'

export default function ExportPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Tools"
        title="Export"
        subtitle="Download your catalogue data."
      />
      <ExportButtons />
    </div>
  )
}
