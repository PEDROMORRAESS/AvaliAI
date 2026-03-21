'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import { EvolutionDataPoint } from '@/types/dashboard'
import { formatDate } from '@/lib/utils'

interface Props {
  data: EvolutionDataPoint[]
  loading: boolean
}

export function EvolutionChart({ data, loading }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    dataFormatada: formatDate(d.data),
    pontuacao_media: Number(d.pontuacao_media),
    total_avaliacoes: Number(d.total_avaliados ?? 0),
    total_atendimentos: Number(d.total_atendimentos ?? 0),
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Evolução Temporal</h2>

      {loading ? (
        <div className="h-56 bg-gray-50 rounded-lg animate-pulse" />
      ) : chartData.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-sm text-gray-400">
          Sem dados no período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="dataFormatada"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(value: number, name: string) => [
                value,
                name === 'pontuacao_media' ? 'Pontuação Média' : 'Total Avaliações',
              ]}
            />
            <Legend
              formatter={(v) => (
                <span className="text-xs text-gray-600">
                  {v === 'pontuacao_media' ? 'Pontuação Média' : 'Total Avaliações'}
                </span>
              )}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="pontuacao_media"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="total_avaliacoes"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              strokeDasharray="4 2"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
