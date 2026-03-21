'use client'

import { Users, Star, MessageSquare, AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react'
import { ResumoGeral } from '@/types/dashboard'

interface Props {
  data: ResumoGeral | null
  loading: boolean
  onAtendimentosClick?: () => void
  onMediaClick?: () => void
  onMensagensClick?: () => void
  onAdvertenciasClick?: () => void
}

function Skeleton() {
  return <div className="h-5 bg-gray-100 rounded animate-pulse" />
}

function DeltaBadge({ current, previous }: { current: number; previous?: number }) {
  if (!previous || previous === 0) return null
  const delta = ((current - previous) / previous) * 100
  const isPos = delta >= 0
  return (
    <span className={`text-xs font-medium flex items-center gap-0.5 ${isPos ? 'text-green-600' : 'text-red-600'}`}>
      {isPos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {Math.abs(delta).toFixed(1)}%
    </span>
  )
}

interface CardProps {
  title: string
  icon: React.ReactNode
  iconBg: string
  loading: boolean
  children: React.ReactNode
  onClick?: () => void
}

function Card({ title, icon, iconBg, loading, children, onClick }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm transition-shadow ${
        onClick ? 'hover:shadow-md cursor-pointer group' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <div className="flex items-center gap-1.5">
          {onClick && (
            <ArrowUpRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
          )}
          <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${iconBg}`}>
            {icon}
          </div>
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : children}
    </div>
  )
}

function StatRow({ label, value, highlight }: { label: string; value: string | number; highlight?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${highlight ?? 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  )
}

const CLASSIFICACAO_COLOR: Record<string, string> = {
  Excelente: 'text-green-600',
  Bom: 'text-blue-600',
  Regular: 'text-amber-600',
  Ruim: 'text-red-600',
}

function getClassLabel(media: number): { label: string; color: string } {
  if (media >= 80) return { label: 'Excelente', color: CLASSIFICACAO_COLOR.Excelente }
  if (media >= 60) return { label: 'Bom', color: CLASSIFICACAO_COLOR.Bom }
  if (media >= 40) return { label: 'Regular', color: CLASSIFICACAO_COLOR.Regular }
  return { label: 'Ruim', color: CLASSIFICACAO_COLOR.Ruim }
}

export function KPICards({ data, loading, onAtendimentosClick, onMediaClick, onMensagensClick, onAdvertenciasClick }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

      {/* Card 1: Total de Atendimentos */}
      <Card
        title="Atendimentos"
        icon={<Users size={18} className="text-blue-600" />}
        iconBg="bg-blue-50"
        loading={loading}
        onClick={onAtendimentosClick}
      >
        <p className="text-3xl font-bold text-gray-900 tabular-nums mb-3">
          {data?.total_atendimentos ?? '—'}
        </p>
        <div className="space-y-1">
          <StatRow
            label="Avaliados"
            value={data?.total_avaliados ?? 0}
            highlight="text-green-600"
          />
          <StatRow
            label="Pulados"
            value={data?.total_pulados ?? 0}
            highlight={data && data.total_pulados > 0 ? 'text-amber-600' : undefined}
          />
          {data && data.total_atendimentos > 0 && (
            <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-green-500"
                style={{ width: `${Math.round((data.total_avaliados / data.total_atendimentos) * 100)}%` }}
              />
            </div>
          )}
          {data && (
            <p className="text-xs text-gray-400 text-right">
              {data.total_atendimentos > 0
                ? `${Math.round((data.total_avaliados / data.total_atendimentos) * 100)}% avaliados`
                : '0% avaliados'}
            </p>
          )}
        </div>
      </Card>

      {/* Card 2: Média Geral APONTE */}
      <Card
        title="Nota Média Geral"
        icon={<Star size={18} className="text-amber-500" />}
        iconBg="bg-amber-50"
        loading={loading}
        onClick={onMediaClick}
      >
        <p className="text-3xl font-bold text-gray-900 tabular-nums mb-3">
          {data ? data.media_geral.toFixed(1) : '—'}
        </p>
        {data && data.media_geral > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Classificação</span>
              <span className={`text-xs font-bold ${getClassLabel(data.media_geral).color}`}>
                {getClassLabel(data.media_geral).label}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-amber-400"
                style={{ width: `${data.media_geral}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 text-right">{data.media_geral.toFixed(1)} / 100 pts</p>
          </div>
        )}
      </Card>

      {/* Card 3: Métricas de Mensagens */}
      <Card
        title="Métricas de Mensagens"
        icon={<MessageSquare size={18} className="text-purple-600" />}
        iconBg="bg-purple-50"
        loading={loading}
        onClick={onMensagensClick}
      >
        <p className="text-3xl font-bold text-gray-900 tabular-nums mb-3">
          {data ? Math.round(data.media_mensagens) : '—'}
          <span className="text-sm font-normal text-gray-400 ml-1">msgs</span>
        </p>
        <div className="space-y-1">
          <StatRow label="Média cliente" value={data ? Math.round(data.media_msgs_cliente) : '—'} />
          <StatRow label="Média atendente" value={data ? Math.round(data.media_msgs_atendente) : '—'} />
          <StatRow
            label="Duração média"
            value={data ? `${Math.round(data.media_duracao)} min` : '—'}
          />
        </div>
      </Card>

      {/* Card 4: Advertências */}
      <Card
        title="Advertências"
        icon={<AlertTriangle size={18} className="text-red-500" />}
        iconBg="bg-red-50"
        loading={loading}
        onClick={onAdvertenciasClick}
      >
        <p className="text-3xl font-bold text-gray-900 tabular-nums mb-3">
          {data?.total_advertencias ?? '—'}
        </p>
        <div className="space-y-1">
          {data && data.total_avaliados > 0 && (
            <StatRow
              label="Taxa"
              value={`${Math.round((data.total_advertencias / data.total_avaliados) * 100)}%`}
              highlight={data.total_advertencias > 0 ? 'text-red-600' : undefined}
            />
          )}
          {data?.top_advertencias.map((a) => (
            <div key={a.tipo} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 truncate">{a.label}</span>
              <span className="text-xs font-medium text-red-600 ml-auto">{a.count}</span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  )
}
