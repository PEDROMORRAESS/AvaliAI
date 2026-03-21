'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { AgentRanking } from '@/types/dashboard'
import { getClassificacaoColor } from '@/lib/utils'

interface Props {
  data: AgentRanking[]
  loading: boolean
}

function scoreToColor(score: number): string {
  if (score >= 80) return getClassificacaoColor('Excelente')
  if (score >= 60) return getClassificacaoColor('Bom')
  if (score >= 40) return getClassificacaoColor('Regular')
  return getClassificacaoColor('Ruim')
}

export function AgentsRanking({ data, loading }: Props) {
  const chartData = data.map((a) => ({
    ...a,
    nome: a.agent_name.split(' ').slice(0, 2).join(' '),
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Ranking de Agentes</h2>

      {loading ? (
        <div className="h-56 bg-gray-50 rounded-lg animate-pulse" />
      ) : chartData.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-sm text-gray-400">
          Sem dados no período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} />
            <YAxis type="category" dataKey="nome" width={80} tick={{ fontSize: 11, fill: '#374151' }} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: number, _n: string, props: any) => [
                `${value} pts · ${props.payload.total_avaliados} avaliados`,
                props.payload.agent_name,
              ]}
            />
            <Bar dataKey="pontuacao_media" radius={[0, 4, 4, 0]} barSize={16}>
              {chartData.map((entry) => (
                <Cell key={entry.agent_name} fill={scoreToColor(entry.pontuacao_media)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
