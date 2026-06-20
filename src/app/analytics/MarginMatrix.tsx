'use client'

import { useEffect, useRef } from 'react'
import {
  Chart,
  BubbleController,
  LinearScale,
  LogarithmicScale,
  PointElement,
  Tooltip,
  type TooltipItem,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { SectionCard } from '@/components/ui/section-card'

Chart.register(BubbleController, LinearScale, LogarithmicScale, PointElement, Tooltip, ChartDataLabels)

// ── Types ─────────────────────────────────────────────────────────────────────

export type MatrixDish = {
  id: string
  name: string
  revenue: number
  marginPct: number
  units: number
}

type BubblePoint = {
  x: number
  y: number
  r: number
  name: string
  units: number
  quadrant: keyof typeof Q_COLORS
}

// ── Constants ─────────────────────────────────────────────────────────────────

const Q_COLORS = {
  star:      '#3D5A2A',
  workhorse: '#854F0B',
  puzzle:    '#7A7D72',
  dog:       '#A32D2D',
} as const

const LEGEND = [
  { key: 'star',      label: 'Star',      sub: 'high revenue · high margin' },
  { key: 'workhorse', label: 'Workhorse', sub: 'high revenue · low margin'  },
  { key: 'puzzle',    label: 'Puzzle',    sub: 'low revenue · high margin'  },
  { key: 'dog',       label: 'Dog',       sub: 'low revenue · low margin'   },
] as const

// ── Helpers ───────────────────────────────────────────────────────────────────

function median(arr: number[]): number {
  if (!arr.length) return 0
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

function classify(
  revenue: number,
  marginPct: number,
  medRev: number,
  medMargin: number,
): keyof typeof Q_COLORS {
  const hi = revenue >= medRev
  const hm = marginPct >= medMargin
  if (hi  && hm)  return 'star'
  if (hi  && !hm) return 'workhorse'
  if (!hi && hm)  return 'puzzle'
  return 'dog'
}

function fmtRev(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}m`
  if (n >= 1_000)     return `Rp ${Math.round(n / 1_000)}k`
  return `Rp ${n}`
}

// ── Threshold line plugin ─────────────────────────────────────────────────────

function makeThresholdPlugin(medRev: number, medMargin: number) {
  return {
    id: 'thresholds',
    afterDraw(chart: Chart) {
      const { ctx, chartArea: { top, bottom, left, right }, scales } = chart
      const xPx = scales.x.getPixelForValue(medRev)
      const yPx = scales.y.getPixelForValue(medMargin)

      ctx.save()
      ctx.setLineDash([4, 5])
      ctx.strokeStyle = 'rgba(30,34,24,0.18)'
      ctx.lineWidth = 1

      ctx.beginPath(); ctx.moveTo(xPx, top);  ctx.lineTo(xPx, bottom); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(left, yPx); ctx.lineTo(right, yPx);  ctx.stroke()

      ctx.restore()
    },
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MarginMatrix({ dishes }: { dishes: MatrixDish[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !dishes.length) return

    const medRev    = median(dishes.map((d) => d.revenue))
    const medMargin = median(dishes.map((d) => d.marginPct))
    const maxUnits  = Math.max(...dishes.map((d) => d.units))

    const points: BubblePoint[] = dishes.map((d) => ({
      x:        d.revenue,
      y:        d.marginPct,
      r:        Math.round(Math.sqrt(d.units / maxUnits) * 14 + 5),
      name:     d.name,
      units:    d.units,
      quadrant: classify(d.revenue, d.marginPct, medRev, medMargin),
    }))

    const bgColors     = points.map((p) => Q_COLORS[p.quadrant] + 'BB')
    const borderColors = points.map((p) => Q_COLORS[p.quadrant])

    chartRef.current?.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bubble',
      plugins: [ChartDataLabels, makeThresholdPlugin(medRev, medMargin)],
      data: {
        datasets: [{
          data:            points,
          backgroundColor: bgColors,
          borderColor:     borderColors,
          borderWidth:     1.5,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        layout: { padding: { right: 80 } },
        scales: {
          x: {
            type: 'logarithmic',
            title: {
              display: true,
              text:    'Revenue (Rp)',
              font:    { size: 10, family: 'inherit' },
              color:   '#7A7D72',
              padding: { top: 6 },
            },
            ticks: {
              font:  { size: 10, family: 'inherit' },
              color: '#7A7D72',
              callback(v) {
                const n = Number(v)
                // Only label round powers-of-10 multiples to avoid crowding
                const log = Math.log10(n)
                if (Math.abs(log - Math.round(log)) > 0.001 && ![2,5].includes(Math.round(n / Math.pow(10, Math.floor(log))))) return ''
                return n >= 1_000_000 ? `${Math.round(n / 1_000_000)}m` : `${Math.round(n / 1_000)}k`
              },
            },
            grid: { color: 'rgba(30,34,24,0.04)' },
          },
          y: {
            title: {
              display: true,
              text:    'Margin %',
              font:    { size: 10, family: 'inherit' },
              color:   '#7A7D72',
              padding: { bottom: 6 },
            },
            ticks: {
              font:  { size: 10, family: 'inherit' },
              color: '#7A7D72',
              callback: (v) => `${v}%`,
            },
            grid: { color: 'rgba(30,34,24,0.04)' },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            displayColors: false,
            callbacks: {
              title: () => '',
              label(ctx: TooltipItem<'bubble'>) {
                const p = ctx.raw as BubblePoint
                return [p.name, `Revenue: ${fmtRev(p.x)}`, `Margin: ${p.y}%`, `Units sold: ${p.units}`]
              },
            },
          },
          datalabels: {
            color:     '#4A4D42',
            font:      { size: 10, family: 'inherit' },
            anchor:    'end',
            align:     'right',
            offset:    4,
            clamp:     true,
            clip:      false,
            formatter: (val: BubblePoint) =>
              val.name.length > 15 ? val.name.slice(0, 14) + '…' : val.name,
          },
        },
      },
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [dishes])

  if (!dishes.length) return null

  return (
    <SectionCard label="Revenue / Margin Matrix">
      <p className="text-[11px] text-ink-muted font-light -mt-1 mb-4">
        Position: revenue × margin%&nbsp;·&nbsp;Bubble size: units sold&nbsp;·&nbsp;Dashed lines: median thresholds
      </p>
      <div className="relative h-[420px]">
        <canvas ref={canvasRef} />
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4 pt-4 border-t border-olive/10">
        {LEGEND.map(({ key, label, sub }) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: Q_COLORS[key] }}
            />
            <span className="text-[11px] text-ink-mid font-medium">{label}</span>
            <span className="text-[11px] text-ink-muted">· {sub}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
