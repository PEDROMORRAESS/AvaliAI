'use client'

import { useEffect, useState } from 'react'
import { X, ExternalLink, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react'
import { AvaliacaoAPONTE } from '@/types/dashboard'
import { formatDateTime, getClassificacaoBadgeClass } from '@/lib/utils'
import { ConversationModal } from './ConversationModal'

interface Props {
  evaluationId: string | null
  onClose: () => void
}

const APONTE_CRITERIA = [
  {
    key: 'acolhimento', label: 'Acolhimento', totalKey: 'acolhimento_total', max: 20,
    commentKey: 'acolhimento_comentarios',
    subItems: [
      { key: 'acolhimento_saudacao_inicial', label: 'Saudação inicial' },
      { key: 'acolhimento_pergunta_nome', label: 'Pergunta o nome' },
      { key: 'acolhimento_uso_nome', label: 'Usa o nome' },
    ],
  },
  {
    key: 'pesquisar', label: 'Pesquisar', totalKey: 'pesquisar_total', max: 26,
    commentKey: 'pesquisar_comentarios',
    subItems: [
      { key: 'pesquisar_escuta_ativa', label: 'Escuta ativa' },
      { key: 'pesquisar_linguagem_empatica', label: 'Linguagem empática' },
      { key: 'pesquisar_tempo_resposta', label: 'Tempo de resposta' },
      { key: 'pesquisar_identificacao_necessidades', label: 'Identifica necessidades' },
    ],
  },
  {
    key: 'oferecer', label: 'Oferecer', totalKey: 'oferecer_total', max: 20,
    commentKey: 'oferecer_comentarios',
    subItems: [
      { key: 'oferecer_conhecimento_produto', label: 'Conhecimento do produto' },
      { key: 'oferecer_sugestoes_produtos', label: 'Sugere produtos' },
      { key: 'oferecer_lidar_objecoes', label: 'Lida com objeções' },
    ],
  },
  {
    key: 'negociar', label: 'Negociar', totalKey: 'negociar_total', max: 18,
    commentKey: 'negociar_comentarios',
    subItems: [
      { key: 'negociar_capacidade_convencimento', label: 'Capacidade de convencimento' },
      { key: 'negociar_construcao_relacionamento', label: 'Construção de relacionamento' },
    ],
  },
  {
    key: 'tomar_iniciativa', label: 'Tomar Iniciativa', totalKey: 'tomar_iniciativa_total', max: 16,
    commentKey: 'tomar_iniciativa_comentarios',
    subItems: [
      { key: 'tomar_iniciativa_verificacao_final', label: 'Verificação final' },
      { key: 'tomar_iniciativa_agradecimento_despedida', label: 'Agradecimento e despedida' },
    ],
  },
] as const

export function EvaluationModal({ evaluationId, onClose }: Props) {
  const [ev, setEv] = useState<AvaliacaoAPONTE | null>(null)
  const [loading, setLoading] = useState(false)
  const [showConversation, setShowConversation] = useState(false)
  const [fullMode, setFullMode] = useState(false)

  useEffect(() => {
    if (!evaluationId) return
    setLoading(true)
    setEv(null)
    setShowConversation(false)
    fetch(`/api/dashboard/evaluation/${evaluationId}`)
      .then((r) => r.json())
      .then((d: AvaliacaoAPONTE) => setEv(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [evaluationId])

  if (!evaluationId) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Detalhes da Avaliação</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            {loading && (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            )}

            {!loading && ev && (
              <>
                {/* Info sessão */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { label: 'Cliente', value: ev.contact_name || '—' },
                    { label: 'Agente', value: ev.agent_name },
                    { label: 'Data/Hora', value: formatDateTime(ev.session_start_at) },
                    { label: 'Duração', value: `${ev.session_duration_minutes} min` },
                    { label: 'Mensagens', value: `${ev.total_messages} total` },
                    { label: 'Cliente/Atendente', value: `${ev.mensagens_cliente ?? 0} / ${ev.mensagens_atendente ?? 0}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                      <p className="font-medium text-gray-800 text-sm">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Avaliação pulada */}
                {ev.avaliacao_pulada && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-amber-700 mb-1">Avaliação Pulada</p>
                    {ev.motivo_pulado && (
                      <p className="text-sm text-amber-600">{ev.motivo_pulado}</p>
                    )}
                  </div>
                )}

                {/* Pontuação geral */}
                {ev.pontuacao_total != null && (
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-700">{ev.pontuacao_total}</p>
                      <p className="text-xs text-blue-500">/ 100 pts</p>
                    </div>
                    <div>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getClassificacaoBadgeClass(ev.classificacao)}`}>
                        {ev.classificacao}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{ev.department_name}</p>
                    </div>
                  </div>
                )}

                {/* Breakdown APONTE */}
                {ev.pontuacao_total != null && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-700">Breakdown APONTE</h3>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={fullMode}
                          onChange={(e) => setFullMode(e.target.checked)}
                          className="w-3.5 h-3.5 accent-blue-600"
                        />
                        <span className="text-xs text-gray-500">Auditoria completa</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      {APONTE_CRITERIA.map(({ key, label, totalKey, max, commentKey, subItems }) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const score = (ev as any)[totalKey] as number | null
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const comment = (ev as any)[commentKey] as string | null
                        if (score == null) return null
                        const pct = Math.round((score / max) * 100)

                        return (
                          <div key={key} className="border border-gray-100 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-semibold text-gray-800">{label}</span>
                              <span className="text-xs font-semibold text-gray-700">{score} / {max} pts</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                              <div
                                className={`h-1.5 rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            {/* Sub-itens — só no modo auditoria */}
                            {fullMode && (
                              <div className="space-y-1.5 mb-1.5 pt-1 border-t border-gray-50">
                                {subItems.map(({ key: sk, label: sl }) => {
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  const sv = (ev as any)[sk] as number | null
                                  if (sv == null) return null
                                  return (
                                    <div key={sk} className="flex items-center justify-between text-xs">
                                      <span className="text-gray-500">{sl}</span>
                                      <span className="font-semibold text-gray-700 tabular-nums">{sv} pts</span>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                            {comment && (
                              <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-1.5">{comment}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Advertência */}
                {ev.advertencia_aplicada && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={16} className="text-red-500" />
                      <h3 className="text-sm font-semibold text-red-700">Advertência Aplicada</h3>
                    </div>
                    {ev.advertencia_motivo && (
                      <p className="text-sm text-red-600">{ev.advertencia_motivo}</p>
                    )}
                  </div>
                )}

                {/* Pontos positivos/melhoria */}
                {(ev.pontos_positivos || ev.pontos_melhoria) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ev.pontos_positivos && (
                      <div className="bg-green-50 rounded-xl p-3">
                        <div className="flex items-center gap-1 mb-1.5">
                          <CheckCircle size={13} className="text-green-600" />
                          <h3 className="text-xs font-semibold text-green-700">Pontos Positivos</h3>
                        </div>
                        <p className="text-xs text-green-700 whitespace-pre-line">{ev.pontos_positivos}</p>
                      </div>
                    )}
                    {ev.pontos_melhoria && (
                      <div className="bg-amber-50 rounded-xl p-3">
                        <div className="flex items-center gap-1 mb-1.5">
                          <AlertTriangle size={13} className="text-amber-600" />
                          <h3 className="text-xs font-semibold text-amber-700">Pontos de Melhoria</h3>
                        </div>
                        <p className="text-xs text-amber-700 whitespace-pre-line">{ev.pontos_melhoria}</p>
                      </div>
                    )}
                  </div>
                )}

                {ev.observacoes_gerais && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <h3 className="text-xs font-semibold text-gray-600 mb-1">Observações Gerais</h3>
                    <p className="text-xs text-gray-600 whitespace-pre-line">{ev.observacoes_gerais}</p>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2">
                  {ev.conversa_formatada && (
                    <button
                      onClick={() => setShowConversation(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-blue-200 text-blue-700 text-sm rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      <MessageSquare size={14} />
                      Ver Conversa
                    </button>
                  )}
                  {ev.preview_url && (
                    <a
                      href={ev.preview_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink size={14} />
                      Abrir no CRC
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showConversation && (
        <ConversationModal evaluation={ev} onClose={() => setShowConversation(false)} />
      )}
    </>
  )
}
