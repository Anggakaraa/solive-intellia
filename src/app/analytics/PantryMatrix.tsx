'use client'

import { useEffect, useRef, useState } from 'react'
import { Chart, ScatterController, LinearScale, PointElement, Tooltip } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { SectionCard } from '@/components/ui/section-card'

Chart.register(ScatterController, LinearScale, PointElement, Tooltip, ChartDataLabels)

export type PantryPoint = {
  name: string
  dishCount: number
  totalUnits: number
  dishNames: string[]
}

export function PantryMatrix({ points }: { points: PantryPoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<Chart | null>(null)

  const [tooltip, setTooltip] = useState<{ point: PantryPoint; x: number; y: number } | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    chartRef.current?.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'scatter',
      data: {
        datasets: [{
          data: points.map((p) => ({ x: p.dishCount, y: p.totalUnits })),
          backgroundColor: 'rgba(61,90,42,0.55)',
          pointRadius: 8,
          pointHoverRadius: 11,
          pointBorderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
          datalabels: {
            align: 'right',
            anchor: 'end',
            offset: 4,
            color: 'rgba(30,34,24,0.7)',
            font: { size: 10, family: 'inherit' },
            formatter: (_: unknown, ctx: { dataIndex: number }) => points[ctx.dataIndex]?.name ?? '',
          },
        },
        scales: {
          x: {
            ticks: { display: false },
            grid: { color: 'rgba(61,90,42,0.08)' },
            border: { display: false },
            title: {
              display: true,
              text: '← fewer dishes  ·  dish presence  ·  more dishes →',
              color: 'rgba(30,34,24,0.4)',
              font: { size: 9 },
              padding: { top: 4 },
            },
          },
          y: {
            ticks: { display: false },
            grid: { color: 'rgba(61,90,42,0.08)' },
            border: { display: false },
            title: {
              display: true,
              text: 'total volume →',
              color: 'rgba(30,34,24,0.4)',
              font: { size: 9 },
            },
          },
        },
        onHover: (event, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index
            const p   = points[idx]
            const el  = elements[0].element
            const rect = canvasRef.current?.getBoundingClientRect()
            if (rect) {
              setTooltip({
                point: p,
                x: rect.left + el.x,
                y: rect.top  + el.y,
              })
            }
          } else {
            setTooltip(null)
          }
        },
      },
    })

    return () => { chartRef.current?.destroy() }
  }, [points])

  return (
    <SectionCard label="Pantry Presence vs Volume">
      <p className="text-[11px] text-ink-muted font-light -mt-1 mb-5">
        X = number of dishes using this ingredient · Y = total units sold across those dishes · Hover for details
      </p>

      <div className="relative h-72">
        <canvas ref={canvasRef} />
      </div>

      {tooltip && (
        <div
          className="fixed z-50 w-52 bg-[#1E2218] text-cream rounded-md shadow-xl px-3 py-2.5 pointer-events-none"
          style={{
            left: tooltip.x,
            top:  tooltip.y - 12,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="text-[12px] font-medium text-cream leading-snug mb-1.5">{tooltip.point.name}</p>
          <p className="text-[9px] uppercase tracking-wide text-cream/50 mb-1">Used in</p>
          {tooltip.point.dishNames.map((n) => (
            <p key={n} className="text-[11px] leading-snug text-cream/90">{n}</p>
          ))}
        </div>
      )}
    </SectionCard>
  )
}
