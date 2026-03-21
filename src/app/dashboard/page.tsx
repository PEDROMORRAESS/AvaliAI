'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { X, SkipForward, TrendingUp, Search } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { FiltersSidebar } from '@/components/dashboard/FiltersSidebar'
import { KPICards } from '@/components/dashboard/KPICards'
import { ClassificationChart } from '@/components/dashboard/ClassificationChart'
import { EvolutionChart } from '@/components/dashboard/EvolutionChart'
import { AgentsRanking } from '@/components/dashboard/AgentsRanking'
import { CriteriaChart } from '@/components/dashboard/CriteriaChart'
import { ScatterChartComponent } from '@/components/dashboard/ScatterChart'
import { EvaluationsTable } from '@/components/dashboard/EvaluationsTable'
import { WarningsGrid } from '@/components/dashboard/WarningsGrid'
import {
  ActiveFilters, DEFAULT_FILTERS,
  ResumoGeral, ClassificationData, EvolutionDataPoint,
  AgentRanking, CriteriaPerformance, ScatterDataPoint, ExclusionReason,
  PaginatedEvaluations, WarningAnalysis,
} from '@/types/dashboard'

function buildQS(filters: ActiveFilters, extra?: Record<string, string>): string {
  const p = new URLSearchParams()
  if (filters.period === 'custom' && filters.dataInicio && filters.dataFim) {
    p.set('dataInicio', filters.dataInicio)
    p.set('dataFim', filters.dataFim)
  } else {
    p.set('period', filters.period)
  }
  if (filters.agentes.length) p.set('agentes', filters.agentes.join(','))
  if (filters.departamentos.length) p.set('departamentos', filters.departamentos.join(','))
  if (filters.clienteNome) p.set('clienteNome', filters.clienteNome)
  if (filters.clienteTelefone) p.set('clienteTelefone', filters.clienteTelefone)
  if (filters.classificacoes.length) p.set('classificacoes', filters.classificacoes.join(','))
  if (filters.advertenciaTipo) p.set('advertenciaTipo', filters.advertenciaTipo)
  else if (filters.apenasComAdvertencia) p.set('apenasComAdvertencia', 'true')
  if (filters.incluirPuladas) p.set('incluirPuladas', 'true')
  if (filters.motivosPulo.length) p.set('motivosPulo', filters.motivosPulo.join(','))
  if (filters.mensagensMinimas > 0) p.set('mensagensMinimas', String(filters.mensagensMinimas))
  if (filters.mensagensMaximas > 0) p.set('mensagensMaximas', String(filters.mensagensMaximas))
  if (filters.duracaoMinima > 0) p.set('duracaoMinima', String(filters.duracaoMinima))
  if (filters.duracaoMaxima > 0) p.set('duracaoMaxima', String(filters.duracaoMaxima))
  if (extra) Object.entries(extra).forEach(([k, v]) => p.set(k, v))
  return p.toString()
}

// ─── Mini-modal genérico ─────────────────────────────────────────────────────

function MiniModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

// ─── Banner de filtros ativos ─────────────────────────────────────────────────

interface FilterBadge {
  id: string
  label: string
  remove: () => void
}

function ActiveFiltersBanner({ badges, onClearAll }: { badges: FilterBadge[]; onClearAll: () => void }) {
  if (badges.length === 0) return null
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap shadow-sm">
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        <Search size={15} className="text-blue-600 flex-shrink-0" />
        <span className="text-xs font-semibold text-blue-900 flex-shrink-0">Filtros ativos:</span>
        {badges.map((b) => (
          <span
            key={b.id}
            className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {b.label}
            <button
              onClick={b.remove}
              className="hover:text-blue-600 ml-0.5"
              title="Remover filtro"
            >
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <button
        onClick={onClearAll}
        className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap flex-shrink-0"
      >
        Limpar todos ✕
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { status } = useSession()
  const router = useRouter()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filters, setFilters] = useState<ActiveFilters>(DEFAULT_FILTERS)
  const [activeWarningTipo, setActiveWarningTipo] = useState<string | null>(null)

  // Table state
  const [tablePage, setTablePage] = useState(1)
  const [tableSortBy, setTableSortBy] = useState('session_start_at')
  const [tableSortOrder, setTableSortOrder] = useState<'asc' | 'desc'>('desc')

  // KPI modal state
  const [kpiModal, setKpiModal] = useState<null | 'atendimentos' | 'media' | 'mensagens' | 'advertencias'>(null)

  // Data
  const [summary, setSummary] = useState<ResumoGeral | null>(null)
  const [classifications, setClassifications] = useState<ClassificationData[]>([])
  const [evolution, setEvolution] = useState<EvolutionDataPoint[]>([])
  const [agents, setAgents] = useState<AgentRanking[]>([])
  const [criteria, setCriteria] = useState<CriteriaPerformance[]>([])
  const [scatter, setScatter] = useState<ScatterDataPoint[]>([])
  const [exclusionReasons, setExclusionReasons] = useState<ExclusionReason[]>([])
  const [evaluations, setEvaluations] = useState<PaginatedEvaluations | null>(null)
  const [warnings, setWarnings] = useState<WarningAnalysis[]>([])

  // Loading
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [loadingCharts, setLoadingCharts] = useState(true)
  const [loadingScatter, setLoadingScatter] = useState(true)
  const [loadingTable, setLoadingTable] = useState(true)

  // Debounce
  const debounceRef = useRef<NodeJS.Timeout>()
  const [debouncedFilters, setDebouncedFilters] = useState<ActiveFilters>(DEFAULT_FILTERS)
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedFilters(filters)
      setTablePage(1)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [filters])

  // ─── Badges derivados dos filtros ──────────────────────────────────────────
  const activeBadges = useMemo((): FilterBadge[] => {
    const badges: FilterBadge[] = []

    if (filters.period === 'custom' && filters.dataInicio) {
      badges.push({
        id: 'period',
        label: `${filters.dataInicio} → ${filters.dataFim}`,
        remove: () => setFilters((f) => ({ ...f, period: '30d', dataInicio: '', dataFim: '' })),
      })
    }

    filters.agentes.forEach((a) =>
      badges.push({
        id: `ag-${a}`,
        label: a.split(' ').slice(0, 2).join(' '),
        remove: () => setFilters((f) => ({ ...f, agentes: f.agentes.filter((x) => x !== a) })),
      })
    )

    filters.departamentos.forEach((d) =>
      badges.push({
        id: `dept-${d}`,
        label: d,
        remove: () => setFilters((f) => ({ ...f, departamentos: f.departamentos.filter((x) => x !== d) })),
      })
    )

    if (filters.clienteNome)
      badges.push({
        id: 'clienteNome',
        label: `"${filters.clienteNome}"`,
        remove: () => setFilters((f) => ({ ...f, clienteNome: '' })),
      })

    if (filters.clienteTelefone)
      badges.push({
        id: 'clienteTel',
        label: filters.clienteTelefone,
        remove: () => setFilters((f) => ({ ...f, clienteTelefone: '' })),
      })

    filters.classificacoes.forEach((c) =>
      badges.push({
        id: `cls-${c}`,
        label: c,
        remove: () => setFilters((f) => ({ ...f, classificacoes: f.classificacoes.filter((x) => x !== c) })),
      })
    )

    if (filters.apenasComAdvertencia)
      badges.push({
        id: 'advertencia',
        label: activeWarningTipo
          ? `Advertência: ${warnings.find((w) => w.tipo === activeWarningTipo)?.label ?? activeWarningTipo}`
          : 'Com Advertência',
        remove: () => {
          setFilters((f) => ({ ...f, apenasComAdvertencia: false, advertenciaTipo: '' }))
          setActiveWarningTipo(null)
        },
      })

    if (filters.incluirPuladas)
      badges.push({
        id: 'puladas',
        label: 'Incluindo Puladas',
        remove: () => setFilters((f) => ({ ...f, incluirPuladas: false })),
      })

    if (filters.mensagensMinimas > 0)
      badges.push({
        id: 'msgMin',
        label: `Msgs ≥ ${filters.mensagensMinimas}`,
        remove: () => setFilters((f) => ({ ...f, mensagensMinimas: 0 })),
      })

    if (filters.mensagensMaximas > 0)
      badges.push({
        id: 'msgMax',
        label: `Msgs ≤ ${filters.mensagensMaximas}`,
        remove: () => setFilters((f) => ({ ...f, mensagensMaximas: 0 })),
      })

    if (filters.duracaoMinima > 0)
      badges.push({
        id: 'durMin',
        label: `≥ ${filters.duracaoMinima} min`,
        remove: () => setFilters((f) => ({ ...f, duracaoMinima: 0 })),
      })

    if (filters.duracaoMaxima > 0)
      badges.push({
        id: 'durMax',
        label: `≤ ${filters.duracaoMaxima} min`,
        remove: () => setFilters((f) => ({ ...f, duracaoMaxima: 0 })),
      })

    filters.motivosPulo.forEach((m) =>
      badges.push({
        id: `pulo-${m}`,
        label: `Pulo: ${m}`,
        remove: () => setFilters((f) => ({ ...f, motivosPulo: f.motivosPulo.filter((x) => x !== m) })),
      })
    )

    return badges
  }, [filters, activeWarningTipo, warnings])

  // ─── Fetch functions ────────────────────────────────────────────────────────

  const fetchMain = useCallback(async () => {
    if (status !== 'authenticated') return
    setLoadingSummary(true)
    setLoadingCharts(true)
    const qs = buildQS(debouncedFilters)
    try {
      const [sumRes, classRes, evoRes, agRes, criRes, warnRes] = await Promise.all([
        fetch(`/api/dashboard/summary?${qs}`),
        fetch(`/api/dashboard/classifications?${qs}`),
        fetch(`/api/dashboard/evolution?${qs}`),
        fetch(`/api/dashboard/agents?${qs}&limit=10`),
        fetch(`/api/dashboard/criteria?${qs}`),
        fetch(`/api/dashboard/warnings?${qs}`),
      ])
      if (sumRes.ok) setSummary(await sumRes.json())
      if (classRes.ok) setClassifications(await classRes.json())
      if (evoRes.ok) setEvolution(await evoRes.json())
      if (agRes.ok) setAgents(await agRes.json())
      if (criRes.ok) setCriteria(await criRes.json())
      if (warnRes.ok) setWarnings(await warnRes.json())
    } catch (e) {
      console.error('[Dashboard] fetchMain:', e)
    } finally {
      setLoadingSummary(false)
      setLoadingCharts(false)
    }
  }, [debouncedFilters, status])

  const fetchScatter = useCallback(async () => {
    if (status !== 'authenticated') return
    setLoadingScatter(true)
    try {
      const res = await fetch(`/api/dashboard/scatter?${buildQS(debouncedFilters)}`)
      if (res.ok) setScatter(await res.json())
    } catch (e) {
      console.error('[Dashboard] fetchScatter:', e)
    } finally {
      setLoadingScatter(false)
    }
  }, [debouncedFilters, status])

  const fetchExclusion = useCallback(async () => {
    if (status !== 'authenticated') return
    try {
      const res = await fetch(`/api/dashboard/exclusion-reasons?${buildQS(debouncedFilters)}`)
      if (res.ok) setExclusionReasons(await res.json())
    } catch (e) {
      console.error('[Dashboard] fetchExclusion:', e)
    }
  }, [debouncedFilters, status])

  const fetchTable = useCallback(async () => {
    if (status !== 'authenticated') return
    setLoadingTable(true)
    const qs = buildQS(debouncedFilters, {
      page: String(tablePage),
      limit: '20',
      sort_by: tableSortBy,
      sort_order: tableSortOrder,
    })
    try {
      const res = await fetch(`/api/dashboard/evaluations?${qs}`)
      if (res.ok) setEvaluations(await res.json())
    } catch (e) {
      console.error('[Dashboard] fetchTable:', e)
    } finally {
      setLoadingTable(false)
    }
  }, [debouncedFilters, tablePage, tableSortBy, tableSortOrder, status])

  useEffect(() => { fetchMain() }, [fetchMain])
  useEffect(() => { fetchScatter() }, [fetchScatter])
  useEffect(() => { fetchExclusion() }, [fetchExclusion])
  useEffect(() => { fetchTable() }, [fetchTable])

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function handleWarningClick(tipo: string) {
    const isActive = activeWarningTipo === tipo
    if (isActive) {
      setActiveWarningTipo(null)
      setFilters((f) => ({ ...f, apenasComAdvertencia: false, advertenciaTipo: '' }))
    } else {
      setActiveWarningTipo(tipo)
      setFilters((f) => ({ ...f, apenasComAdvertencia: true, advertenciaTipo: tipo }))
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 400)
    }
  }

  function clearAllFilters() {
    setFilters({ ...DEFAULT_FILTERS, advertenciaTipo: '' })
    setActiveWarningTipo(null)
  }

  // ─────────────────────────────────────────────────────────────────────────────

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((o) => !o)} />

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <FiltersSidebar
            filters={filters}
            onChange={setFilters}
            onCollapse={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 min-w-0">
          <KPICards
            data={summary}
            loading={loadingSummary}
            onAtendimentosClick={() => setKpiModal('atendimentos')}
            onMediaClick={() => setKpiModal('media')}
            onMensagensClick={() => setKpiModal('mensagens')}
            onAdvertenciasClick={() => setKpiModal('advertencias')}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ClassificationChart data={classifications} loading={loadingCharts} />
            <EvolutionChart data={evolution} loading={loadingCharts} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AgentsRanking data={agents} loading={loadingCharts} />
            <CriteriaChart data={criteria} loading={loadingCharts} />
          </div>

          <ScatterChartComponent data={scatter} loading={loadingScatter} />

          <WarningsGrid
            data={warnings}
            loading={loadingCharts}
            activeWarningTipo={activeWarningTipo}
            onCardClick={handleWarningClick}
          />

          {/* Banner de filtros ativos + tabela */}
          <div ref={tableRef} className="space-y-3">
            <ActiveFiltersBanner badges={activeBadges} onClearAll={clearAllFilters} />
            <EvaluationsTable
              data={evaluations}
              loading={loadingTable}
              totalGeral={summary?.total_atendimentos}
              onPageChange={setTablePage}
              onSortChange={(col, order) => { setTableSortBy(col); setTableSortOrder(order) }}
              sortBy={tableSortBy}
              sortOrder={tableSortOrder}
            />
          </div>
        </main>
      </div>

      {/* ── KPI Modals ──────────────────────────────────────────────────────── */}

      {kpiModal === 'atendimentos' && (
        <MiniModal title="Motivos de Exclusão" onClose={() => setKpiModal(null)}>
          {exclusionReasons.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
              <SkipForward size={24} className="text-gray-300" />
              Nenhuma avaliação pulada no período
            </div>
          ) : (
            <div className="space-y-2">
              {exclusionReasons.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{r.motivo}</span>
                  <span className="text-sm font-semibold text-amber-600 tabular-nums ml-4">{r.count}</span>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-1">
                Total: {exclusionReasons.reduce((s, r) => s + r.count, 0)} atendimentos pulados
              </p>
            </div>
          )}
        </MiniModal>
      )}

      {kpiModal === 'media' && (
        <MiniModal title="Evolução da Nota Média" onClose={() => setKpiModal(null)}>
          {evolution.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">Sem dados no período</div>
          ) : (
            <div className="space-y-1.5">
              {[...evolution].reverse().slice(0, 15).map((p, i) => {
                const pct = Math.round((p.pontuacao_media / 100) * 100)
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-20 flex-shrink-0">{p.data?.slice(0, 10)}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 tabular-nums w-12 text-right">
                      {p.pontuacao_media.toFixed(1)} pts
                    </span>
                  </div>
                )
              })}
              <p className="text-xs text-gray-400 pt-2">Últimos {Math.min(evolution.length, 15)} períodos</p>
            </div>
          )}
        </MiniModal>
      )}

      {kpiModal === 'mensagens' && (
        <MiniModal title="Distribuição de Mensagens" onClose={() => setKpiModal(null)}>
          {scatter.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">Sem dados no período</div>
          ) : (
            <div className="space-y-3">
              {(() => {
                const buckets = [
                  { label: '1–10 msgs', min: 1, max: 10 },
                  { label: '11–20 msgs', min: 11, max: 20 },
                  { label: '21–40 msgs', min: 21, max: 40 },
                  { label: '41–60 msgs', min: 41, max: 60 },
                  { label: '61+ msgs', min: 61, max: Infinity },
                ]
                const maxCount = Math.max(...buckets.map((b) =>
                  scatter.filter((d) => d.total_messages >= b.min && d.total_messages <= b.max).length
                ))
                return buckets.map((b) => {
                  const count = scatter.filter((d) => d.total_messages >= b.min && d.total_messages <= b.max).length
                  return (
                    <div key={b.label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24 flex-shrink-0">{b.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-400"
                          style={{ width: maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 tabular-nums w-8 text-right">{count}</span>
                    </div>
                  )
                })
              })()}
              <p className="text-xs text-gray-400 pt-1">{scatter.length} atendimentos no período</p>
            </div>
          )}
        </MiniModal>
      )}

      {kpiModal === 'advertencias' && (
        <MiniModal title="Análise de Advertências" onClose={() => setKpiModal(null)}>
          {warnings.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">Nenhuma advertência no período</div>
          ) : (
            <div className="space-y-2">
              {warnings.map((w) => (
                <button
                  key={w.tipo}
                  onClick={() => {
                    handleWarningClick(w.tipo)
                    setKpiModal(null)
                  }}
                  className="w-full flex items-center justify-between p-3 border border-red-100 bg-red-50/40 rounded-xl hover:bg-red-100 hover:border-red-300 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{w.label}</p>
                    <p className="text-xs text-gray-500">{w.percentual}% dos atendimentos avaliados</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-red-600 tabular-nums">{w.count}</span>
                    <TrendingUp size={14} className="text-red-400" />
                  </div>
                </button>
              ))}
              <p className="text-xs text-gray-400 pt-1">Clique em um tipo para filtrar a tabela</p>
            </div>
          )}
        </MiniModal>
      )}
    </div>
  )
}
