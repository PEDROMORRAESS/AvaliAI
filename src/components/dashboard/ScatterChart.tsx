'use client'

import {
  ScatterChart as RechartsScatter, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ZAxis, Legend,
} from 'recharts'
import { ScatterDataPoint } from '@/types/dashboard'
import { getClassificacaoColor } from '@/lib/utils'

interface Props {
  data: ScatterDataPoint[]
  loading: boolean
}

const CLASSIFICACOES = ['Excelente', 'Bom', 'Regular', 'Ruim']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload as ScatterDataPoint
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-800 mb-1">{d.classificacao}</p>
      <p className="text-gray-600">{d.total_messages} mensagens totais</p>
      <p className="text-gray-600">{d.mensagens_cliente} msgs cliente</p>
      <p className="text-gray-600">{d.mensagens_atendente} msgs atendente</p>
      <p className="text-gray-600">{d.session_duration_minutes} minutos</p>
      <p className="font-semibold text-blue-700 mt-1">{d.pontuacao_total} pontos</p>
    </div>
  )
}

export function ScatterChartComponent({ data, loading }: Props) {
  // Agrupa por classificação para plotar com cores diferentes
  const byClass = CLASSIFICACOES.map((c) => ({
    name: c,
    color: getClassificacaoColor(c as any),
    data: data.filter((d) => d.classificacao === c),
  })).filter((g) => g.data.length > 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Impacto do Volume na Qualidade</h2>
        <p className="text-xs text-gray-400">Cada ponto = 1 atendimento · tamanho = duração da conversa</p>
      </div>

      {loading ? (
        <div className="h-56 bg-gray-50 rounded-lg animate-pulse" />
      ) : data.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-sm text-gray-400">
          Sem dados no período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <RechartsScatter margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              dataKey="total_messages"
              name="Qtd. Mensagens"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              label={{ value: 'Qtd. de mensagens', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#9ca3af' }}
            />
            <YAxis
              type="number"
              dataKey="pontuacao_total"
              name="Pontuação APONTE"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              label={{ value: 'Pontuação APONTE', angle: -90, position: 'insideLeft', offset: 20, fontSize: 10, fill: '#9ca3af' }}
            />
            <ZAxis
              type="number"
              dataKey="session_duration_minutes"
              range={[30, 200]}
              name="Duração (min)"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(v) => <span className="text-xs text-gray-600">{v}</span>}
              iconSize={8}
            />
            {byClass.map(({ name, color, data: pts }) => (
              <Scatter key={name} name={name} data={pts} fill={color} fillOpacity={0.7} />
            ))}
          </RechartsScatter>
        </ResponsiveContainer>
      )}
    </div>
  )
}
