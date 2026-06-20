'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { inputCls, mutedBtnCls } from '@/lib/styles'

type Props = {
  minDate: string  // 'YYYY-MM-DD'
  maxDate: string  // 'YYYY-MM-DD'
}

export function PeriodPicker({ minDate, maxDate }: Props) {
  const router      = useRouter()
  const searchParams = useSearchParams()

  const from = searchParams.get('from') ?? ''
  const to   = searchParams.get('to')   ?? ''

  function update(key: 'from' | 'to', value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else        params.delete(key)
    router.push(`/analytics?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={from}
        min={minDate}
        max={to || maxDate}
        onChange={(e) => update('from', e.target.value)}
        className={cn(inputCls, 'w-[148px] py-1.5 text-[13px]')}
      />
      <span className="text-ink-muted text-sm select-none">–</span>
      <input
        type="date"
        value={to}
        min={from || minDate}
        max={maxDate}
        onChange={(e) => update('to', e.target.value)}
        className={cn(inputCls, 'w-[148px] py-1.5 text-[13px]')}
      />
      {(from || to) && (
        <button
          onClick={() => router.push('/analytics')}
          className={cn(mutedBtnCls, 'text-[12px] ml-1')}
        >
          Clear
        </button>
      )}
    </div>
  )
}
