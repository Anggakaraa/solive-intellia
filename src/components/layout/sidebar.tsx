'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  UtensilsCrossed,
  ShoppingBasket,
  BookOpen,
  Settings,
  Download,
  Lightbulb,
  Clock,
  Bookmark,
  FolderOpen,
  Palette,
  BarChart2,
  FlaskConical,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react'

const sections = [
  {
    label: 'Analytics',
    defaultOpen: true,
    items: [
      { href: '/analytics', label: 'Performance', icon: BarChart2 },
      { href: '/analytics/intelligence', label: 'Menu Intelligence', icon: FlaskConical },
    ],
  },
  {
    label: 'R&D',
    defaultOpen: true,
    items: [
      { href: '/brief', label: 'New Brief', icon: Lightbulb },
      { href: '/brief/history', label: 'Brief History', icon: Clock },
      { href: '/saved/items', label: 'Saved Dishes', icon: Bookmark },
      { href: '/saved/collections', label: 'Saved Collections', icon: FolderOpen },
    ],
  },
  {
    label: 'Catalogue',
    defaultOpen: true,
    items: [
      { href: '/menu-items', label: 'Menu Items', icon: UtensilsCrossed },
      { href: '/pantry-items', label: 'Pantry Items', icon: ShoppingBasket },
      { href: '/principles', label: 'Principles', icon: BookOpen },
      { href: '/reference', label: 'Reference Data', icon: Settings },
    ],
  },
  {
    label: 'Tools',
    defaultOpen: false,
    items: [
      { href: '/tools/ff-fd-survey', label: 'FF/FD Survey', icon: SlidersHorizontal },
      { href: '/export', label: 'Export', icon: Download },
      { href: '/tools/components', label: 'Component Library', icon: Palette },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/brief') return pathname === '/brief'
    if (href === '/analytics') return pathname === '/analytics'
    return pathname.startsWith(href)
  }

  // Auto-expand any section that contains the active page
  function sectionHasActive(items: { href: string }[]) {
    return items.some((item) => isActive(item.href))
  }

  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((s) => [s.label, s.defaultOpen]))
  )

  // If navigation lands on a page inside a collapsed section, expand it
  useEffect(() => {
    setOpen((prev) => {
      const next = { ...prev }
      sections.forEach((s) => {
        if (sectionHasActive(s.items)) next[s.label] = true
      })
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  function toggle(label: string) {
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <aside className="w-[200px] shrink-0 bg-olive flex flex-col h-full">
      <div className="px-5 py-6 border-b border-white/10 shrink-0">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Salted Olive"
            width={100}
            height={67}
            className="object-contain object-left -ml-1.5"
            priority
          />
          <p className="font-serif text-xl font-normal text-cream mt-2.5">
            Intellia
          </p>
        </Link>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {sections.map(({ label, items }) => {
          const isOpen = open[label]
          const hasActive = sectionHasActive(items)

          return (
            <div key={label} className="mt-3">
              {/* Section header — clickable to toggle */}
              <button
                onClick={() => toggle(label)}
                className="w-full flex items-center justify-between px-5 mb-1 group"
              >
                <span className={cn(
                  'text-[9px] uppercase tracking-[1.8px] transition-colors',
                  hasActive ? 'text-cream/70' : 'text-cream/35 group-hover:text-cream/55',
                )}>
                  {label}
                </span>
                <ChevronDown
                  size={10}
                  className={cn(
                    'transition-transform text-cream/30 group-hover:text-cream/50',
                    isOpen ? 'rotate-0' : '-rotate-90',
                  )}
                />
              </button>

              {/* Items */}
              {isOpen && items.map(({ href, label: itemLabel, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 px-5 py-2 text-[13px] transition-colors',
                    isActive(href)
                      ? 'text-cream font-medium bg-cream/[0.13] border-r-2 border-cream'
                      : 'text-cream/65 hover:text-cream hover:bg-white/[0.07]'
                  )}
                >
                  <Icon
                    size={13}
                    className={cn('shrink-0', isActive(href) ? 'opacity-100' : 'opacity-70')}
                  />
                  {itemLabel}
                </Link>
              ))}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
