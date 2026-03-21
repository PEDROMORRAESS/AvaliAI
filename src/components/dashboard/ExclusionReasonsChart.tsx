'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { ExclusionReason } from '@/types/dashboard'
import { SkipForward } from 'lucide-react'

interface Props {
  data: ExclusionReason[]
  loading: boolean
}

const COLORS = ['#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6']

export function ExclusionReasonsChart({ data, loading }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    label: d.motivo.length > 25 ? d.motivo.slice(0, 22) + '...' : d.motivo,
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <SkipForward size={14} className="text-gray-500" />
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Motivos de Exclusão</h2>
          <p className="text-xs text-gray-400">Avaliações puladas por motivo</p>
        </div>
      </div>

      {loading ? (
        <div className="h-44 bg-gray-50 rounded-lg animate-pulse" />
      ) : data.length === 0 ? (
        <div className="h-44 flex items-center justify-center text-sm text-gray-400">
          Nenhuma avaliação pulada no período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={120}
              tick={{ fontSize: 10, fill: '#374151' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8 }}
              formatter={(v: number, _n: string, props) => [
                `${v} ocorrências`,
                props.payload.motivo,
              ]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
