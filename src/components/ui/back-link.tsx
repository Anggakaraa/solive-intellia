import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface BackLinkProps {
  href: string
  label: string
}

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-6 transition-colors"
    >
      <ChevronLeft size={14} />
      {label}
    </Link>
  )
}
