'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBasket,
  BookOpen,
  Settings,
  Download,
  Lightbulb,
} from 'lucide-react'

const sections = [
  {
    label: 'Catalogue',
    items: [
      { href: '/', label: 'Overview', icon: LayoutDashboard },
      { href: '/menu-items', label: 'Menu Items', icon: UtensilsCrossed },
      { href: '/pantry-items', label: 'Pantry Items', icon: ShoppingBasket },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { href: '/principles', label: 'Principles', icon: BookOpen },
      { href: '/reference', label: 'Reference Data', icon: Settings },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/brief', label: 'R&D Brief', icon: Lightbulb },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/export', label: 'Export', icon: Download },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <aside className="w-[220px] shrink-0 bg-olive flex flex-col min-h-screen">
      <div className="px-6 py-7 border-b border-white/10">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Salted Olive"
            width={110}
            height={73}
            className="object-contain object-left -ml-2"
            priority
          />
          <p className="font-serif text-2xl font-normal text-cream mt-3">
            Intellia
          </p>
        </Link>
      </div>

      <nav className="flex-1 py-3">
        {sections.map(({ label, items }) => (
          <div key={label} className="mt-4">
            <p className="text-[9px] uppercase tracking-[1.8px] text-cream/40 px-6 mb-1.5">
              {label}
            </p>
            {items.map(({ href, label: itemLabel, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-6 py-2.5 text-sm transition-colors',
                  isActive(href)
                    ? 'text-cream font-medium bg-cream/[0.13] border-r-2 border-cream'
                    : 'text-cream/70 hover:text-cream hover:bg-white/[0.07]'
                )}
              >
                <Icon
                  className={cn(
                    'shrink-0 opacity-80',
                    isActive(href) ? 'opacity-100' : ''
                  )}
                  size={15}
                />
                {itemLabel}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
