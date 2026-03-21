'use client'

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import { CriteriaPerformance } from '@/types/dashboard'

interface Props {
  data: CriteriaPerformance[]
  loading: boolean
}

export function CriteriaChart({ data, loading }: Props) {
  const chartData = data.map((d) => ({
    criterio: d.label,
    percentual: d.percentual,
    obtido: d.obtido,
    maximo: d.maximo,
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Performance por Critério APONTE</h2>

      {loading ? (
        <div className="h-56 bg-gray-50 rounded-lg animate-pulse" />
      ) : chartData.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-sm text-gray-400">
          Sem dados no período
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="criterio"
                tick={{ fontSize: 11, fill: '#374151' }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: '#9ca3af' }}
                axisLine={false}
              />
              <Radar
                name="% Aproveitamento"
                dataKey="percentual"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(value: number, _name: string, props) => [
                  `${value}% (${props.payload.obtido}/${props.payload.maximo} pts)`,
                  'Aproveitamento',
                ]}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* Barra de progresso por critério */}
          <div className="mt-2 space-y-1.5">
            {data.map((c) => (
              <div key={c.criterio} className="flex items-center gap-2">
                <span className="w-5 text-xs font-bold text-blue-600">{c.criterio}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-blue-500"
                    style={{ width: `${c.percentual}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">
                  {c.obtido}/{c.maximo} pts
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
