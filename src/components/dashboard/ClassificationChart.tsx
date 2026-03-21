'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { ClassificationData } from '@/types/dashboard'
import { getClassificacaoColor } from '@/lib/utils'

interface Props {
  data: ClassificationData[]
  loading: boolean
}

export function ClassificationChart({ data, loading }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Distribuição de Classificações</h2>

      {loading ? (
        <div className="h-56 bg-gray-50 rounded-lg animate-pulse" />
      ) : data.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-sm text-gray-400">
          Sem dados no período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="classificacao"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={entry.classificacao} fill={getClassificacaoColor(entry.classificacao)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} avaliações`,
                name,
              ]}
            />
            <Legend
              formatter={(value, entry) => (
                <span className="text-xs text-gray-600">
                  {value} ({((entry.payload as unknown) as ClassificationData).percentual}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
