'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, ExternalLink, AlertTriangle, ChevronLeft, ChevronRight, SkipForward, MessageSquare, LayoutGrid, TableProperties, Download } from 'lucide-react'
import { PaginatedEvaluations, AvaliacaoAPONTE } from '@/types/dashboard'
import { formatDate, getClassificacaoBadgeClass } from '@/lib/utils'
import { EvaluationModal } from './EvaluationModal'
import { ConversationModal } from './ConversationModal'

interface Props {
  data: PaginatedEvaluations | null
  loading: boolean
  totalGeral?: number
  onPageChange: (page: number) => void
  onSortChange: (col: string, order: 'asc' | 'desc') => void
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

const COLUMNS = [
  { key: 'session_start_at', label: 'Data' },
  { key: 'agent_name', label: 'Agente' },
  { key: 'contact_name', label: 'Cliente' },
  { key: 'total_messages', label: 'Msgs' },
  { key: 'session_duration_minutes', label: 'Duração' },
  { key: 'pontuacao_total', label: 'Pts' },
  { key: 'classificacao', label: 'Classificação' },
  { key: '_status', label: 'Status', sortable: false },
  { key: '_acoes', label: 'Ações', sortable: false },
]

export function EvaluationsTable({ data, loading, totalGeral, onPageChange, onSortChange, sortBy, sortOrder }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [conversationEv, setConversationEv] = useState<AvaliacaoAPONTE | null>(null)
  const [planilhaMode, setPlanilhaMode] = useState(false)

  function toggleSort(col: string) {
    onSortChange(col, sortBy === col && sortOrder === 'desc' ? 'asc' : 'desc')
  }

  function SortIcon({ col }: { col: string }) {
    if (sortBy !== col) return <ChevronUp size={11} className="text-gray-300" />
    return sortOrder === 'asc'
      ? <ChevronUp size={11} className="text-blue-600" />
      : <ChevronDown size={11} className="text-blue-600" />
  }

  async function openConversation(id: string) {
    const res = await fetch(`/api/dashboard/evaluation/${id}`)
    if (res.ok) {
      const ev = await res.json() as AvaliacaoAPONTE
      setConversationEv(ev)
    }
  }

  function exportCSV() {
    if (!data?.data) return
    const header = ['Data', 'Agente', 'Cliente', 'Msgs', 'Msgs Cliente', 'Msgs Atendente', 'Duração (min)', 'Pts', 'Classificação', 'Status']
    const rows = data.data.map((ev) => [
      formatDate(ev.session_start_at),
      ev.agent_name,
      ev.contact_name || '',
      ev.total_messages,
      ev.mensagens_cliente ?? '',
      ev.mensagens_atendente ?? '',
      ev.session_duration_minutes,
      ev.pontuacao_total ?? '',
      ev.classificacao || '',
      ev.avaliacao_pulada ? 'Pulado' : 'Avaliado',
    ])
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `avaliacoes-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const planilhaTd = planilhaMode
    ? 'px-3 py-2 border border-gray-200 font-mono text-xs tabular-nums'
    : 'px-4 py-3'
  const planilhaTr = planilhaMode
    ? 'border border-gray-200 even:bg-gray-50 hover:bg-blue-50/30 cursor-pointer transition-colors'
    : 'border-b border-gray-100 hover:bg-blue-50/20 cursor-pointer transition-colors'

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-sm font-semibold text-gray-800">
          Avaliações Detalhadas
          {data && (
            <span className="font-normal ml-2">
              {totalGeral && data.total !== totalGeral ? (
                <>
                  <span className="text-blue-600">({data.total}</span>
                  <span className="text-gray-400"> de {totalGeral})</span>
                </>
              ) : (
                <span className="text-gray-400">({data.total})</span>
              )}
            </span>
          )}
        </h2>

        <div className="flex items-center gap-2">
          {/* Toggle modo */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setPlanilhaMode(false)}
              title="Modo grade"
              className={`p-1.5 transition-colors ${!planilhaMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setPlanilhaMode(true)}
              title="Modo planilha"
              className={`p-1.5 transition-colors ${planilhaMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <TableProperties size={14} />
            </button>
          </div>

          {/* Exportar CSV */}
          <button
            onClick={exportCSV}
            disabled={!data?.data?.length}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40"
          >
            <Download size={13} />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${planilhaMode ? 'border-collapse' : ''}`}>
          <thead>
            <tr className={planilhaMode ? 'bg-gray-100 border border-gray-200' : 'bg-gray-50 border-b border-gray-200'}>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && toggleSort(col.key)}
                  className={`${planilhaMode ? 'px-3 py-2 border border-gray-200 font-mono' : 'px-4 py-3'} text-left text-xs font-medium text-gray-500 whitespace-nowrap ${
                    col.sortable !== false ? 'cursor-pointer hover:text-gray-700 select-none' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && <SortIcon col={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && [...Array(8)].map((_, i) => (
              <tr key={i} className="border-b border-gray-100">
                {COLUMNS.map((c) => (
                  <td key={c.key} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}

            {!loading && (!data?.data || data.data.length === 0) && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-sm text-gray-400">
                  Nenhuma avaliação encontrada
                </td>
              </tr>
            )}

            {!loading && data?.data.map((ev) => (
              <tr
                key={ev.session_id}
                className={planilhaTr}
                onClick={() => setSelectedId(ev.session_id)}
              >
                <td className={`${planilhaTd} text-gray-600 whitespace-nowrap text-xs`}>
                  {formatDate(ev.session_start_at)}
                </td>
                <td className={`${planilhaTd} font-medium text-gray-800 max-w-[120px] truncate text-xs`}>
                  {ev.agent_name}
                </td>
                <td className={`${planilhaTd} text-gray-600 max-w-[120px] truncate text-xs`}>
                  {ev.contact_name || '—'}
                </td>
                <td className={`${planilhaTd} text-gray-600 text-xs tabular-nums`}>
                  <span title={`${ev.mensagens_cliente ?? 0} cliente / ${ev.mensagens_atendente ?? 0} atendente`}>
                    {ev.total_messages}
                  </span>
                </td>
                <td className={`${planilhaTd} text-gray-600 text-xs tabular-nums`}>
                  {ev.session_duration_minutes}m
                </td>
                <td className={`${planilhaTd} font-semibold text-gray-900 tabular-nums text-xs`}>
                  {ev.pontuacao_total ?? '—'}
                </td>
                <td className={planilhaTd}>
                  {ev.avaliacao_pulada ? (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Pulado</span>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getClassificacaoBadgeClass(ev.classificacao)}`}>
                      {ev.classificacao}
                    </span>
                  )}
                </td>
                <td className={planilhaTd}>
                  <div className="flex items-center gap-1.5">
                    {ev.avaliacao_pulada && (
                      <span title={ev.motivo_pulado ?? 'Pulado'}>
                        <SkipForward size={13} className="text-amber-500" />
                      </span>
                    )}
                    {ev.advertencia_aplicada && (
                      <AlertTriangle size={13} className="text-red-500" />
                    )}
                  </div>
                </td>
                <td className={planilhaTd} onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openConversation(ev.session_id)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Ver conversa"
                    >
                      <MessageSquare size={14} />
                    </button>
                    {ev.preview_url && (
                      <a
                        href={ev.preview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Abrir no CRC"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {data && data.total_pages > 1 && (
        <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {(data.page - 1) * data.limit + 1}–{Math.min(data.page * data.limit, data.total)} de {data.total}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(data.page - 1)}
              disabled={data.page <= 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-2 text-gray-700">{data.page} / {data.total_pages}</span>
            <button
              onClick={() => onPageChange(data.page + 1)}
              disabled={data.page >= data.total_pages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Modais */}
      <EvaluationModal evaluationId={selectedId} onClose={() => setSelectedId(null)} />
      {conversationEv && (
        <ConversationModal evaluation={conversationEv} onClose={() => setConversationEv(null)} />
      )}
    </div>
  )
}
