/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck — Supabase query builder generics; runtime is fully typed
import { supabase } from './db'
import {
  ResumoGeral,
  ClassificationData,
  EvolutionDataPoint,
  AgentRanking,
  CriteriaPerformance,
  ScatterDataPoint,
  ExclusionReason,
  PaginatedEvaluations,
  AvaliacaoAPONTE,
  WarningAnalysis,
  FilterParams,
} from '@/types/dashboard'

const TABLE = 'fazendao_aponte_relatorio'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function parsePeriodDays(period: string): number {
  return ({ '7d': 7, '30d': 30, '90d': 90, '180d': 180, '365d': 365 } as Record<string, number>)[period] ?? 30
}

function periodStartISO(period: string): string {
  const d = new Date()
  d.setDate(d.getDate() - parsePeriodDays(period))
  return d.toISOString()
}

function avg(arr: number[]): number {
  if (!arr.length) return 0
  return Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10
}

// Aplica filtros ao query builder Supabase
function applyFilters(query: any, params: FilterParams): any {
  // Período / datas
  if (params.dataInicio && params.dataFim) {
    query = query
      .gte('session_start_at', params.dataInicio)
      .lte('session_start_at', params.dataFim)
  } else {
    query = query.gte('session_start_at', periodStartISO(params.period ?? '30d'))
  }

  // Agentes
  if (params.agentes) {
    query = query.in('agent_name', params.agentes.split(','))
  }

  // Departamentos
  if (params.departamentos) {
    query = query.in('department_name', params.departamentos.split(','))
  }

  // Cliente nome (busca parcial)
  if (params.clienteNome) {
    query = query.ilike('contact_name', `%${params.clienteNome}%`)
  }

  // Cliente telefone
  if (params.clienteTelefone) {
    query = query.ilike('contact_phone', `%${params.clienteTelefone}%`)
  }

  // Classificações
  if (params.classificacoes) {
    query = query.in('classificacao', params.classificacoes.split(','))
  }

  // Advertência
  if (params.advertenciaTipo) {
    // Filtra pelo tipo específico de advertência (campo booleano)
    query = query.eq(params.advertenciaTipo, true)
  } else if (params.apenasComAdvertencia === 'true') {
    query = query.eq('advertencia_aplicada', true)
  }

  // Avaliações puladas
  if (params.incluirPuladas !== 'true') {
    query = query.eq('avaliacao_pulada', false)
  }

  // Motivos de pulo
  if (params.motivosPulo) {
    query = query.in('motivo_pulado', params.motivosPulo.split(','))
  }

  // Mensagens
  if (params.mensagensMinimas && Number(params.mensagensMinimas) > 0) {
    query = query.gte('total_messages', Number(params.mensagensMinimas))
  }
  if (params.mensagensMaximas && Number(params.mensagensMaximas) > 0) {
    query = query.lte('total_messages', Number(params.mensagensMaximas))
  }

  // Duração
  if (params.duracaoMinima && Number(params.duracaoMinima) > 0) {
    query = query.gte('session_duration_minutes', Number(params.duracaoMinima))
  }
  if (params.duracaoMaxima && Number(params.duracaoMaxima) > 0) {
    query = query.lte('session_duration_minutes', Number(params.duracaoMaxima))
  }

  return query
}

// ─── RESUMO GERAL ─────────────────────────────────────────────────────────────

export async function getResumo(params: FilterParams): Promise<ResumoGeral> {
  const COLS = [
    'pontuacao_total', 'classificacao', 'advertencia_aplicada', 'avaliacao_pulada',
    'total_messages', 'mensagens_cliente', 'mensagens_atendente', 'session_duration_minutes',
    'advertencia_reclamacao_cliente', 'advertencia_falta_esclarecimento',
    'advertencia_promessas_nao_alinhadas', 'advertencia_conduta_inadequada',
    'advertencia_falta_entendimento', 'advertencia_demora_excessiva',
    'advertencia_descumprimento_processos',
  ].join(',')

  const { data = [] } = await applyFilters(
    supabase.from(TABLE).select(COLS).limit(50000),
    { ...params, incluirPuladas: 'true' } // busca todos, depois filtra
  ) as { data: any[] }

  const rows = data ?? []
  const avaliados = rows.filter((r: any) => !r.avaliacao_pulada)
  const pulados = rows.filter((r: any) => r.avaliacao_pulada)
  const comAdvertencia = avaliados.filter((r: any) => r.advertencia_aplicada)

  const ADVERTENCIA_TIPOS = [
    { key: 'advertencia_reclamacao_cliente', label: 'Reclamação do Cliente' },
    { key: 'advertencia_falta_esclarecimento', label: 'Falta de Esclarecimento' },
    { key: 'advertencia_promessas_nao_alinhadas', label: 'Promessas não Alinhadas' },
    { key: 'advertencia_conduta_inadequada', label: 'Conduta Inadequada' },
    { key: 'advertencia_falta_entendimento', label: 'Falta de Entendimento' },
    { key: 'advertencia_demora_excessiva', label: 'Demora Excessiva' },
    { key: 'advertencia_descumprimento_processos', label: 'Descumprimento de Processos' },
  ]

  const top_advertencias = ADVERTENCIA_TIPOS
    .map(({ key, label }) => ({
      tipo: key,
      label,
      count: comAdvertencia.filter((r: any) => r[key] === true).length,
    }))
    .filter((a) => a.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  return {
    total_atendimentos: rows.length,
    total_avaliados: avaliados.length,
    total_pulados: pulados.length,
    media_geral: avg(avaliados.map((r: any) => Number(r.pontuacao_total ?? 0)).filter(Boolean)),
    media_mensagens: avg(avaliados.map((r: any) => Number(r.total_messages ?? 0))),
    media_msgs_cliente: avg(avaliados.map((r: any) => Number(r.mensagens_cliente ?? 0))),
    media_msgs_atendente: avg(avaliados.map((r: any) => Number(r.mensagens_atendente ?? 0))),
    media_duracao: avg(avaliados.map((r: any) => Number(r.session_duration_minutes ?? 0))),
    total_advertencias: comAdvertencia.length,
    top_advertencias,
  }
}

// ─── CLASSIFICAÇÕES ───────────────────────────────────────────────────────────

export async function getClassifications(params: FilterParams): Promise<ClassificationData[]> {
  const { data = [] } = await applyFilters(
    supabase.from(TABLE).select('classificacao,avaliacao_pulada').limit(50000),
    { ...params, incluirPuladas: 'true' }
  ) as { data: any[] }

  const rows = data ?? []
  const counts = new Map<string, number>()

  for (const r of rows) {
    const c = r.avaliacao_pulada ? 'Não Avaliado' : (r.classificacao ?? 'Não Avaliado')
    counts.set(c, (counts.get(c) ?? 0) + 1)
  }

  const total = rows.length
  const ORDER = ['Excelente', 'Bom', 'Regular', 'Ruim', 'Não Avaliado']

  return ORDER
    .filter((c) => counts.has(c))
    .map((c) => ({
      classificacao: c,
      count: counts.get(c) ?? 0,
      percentual: total > 0 ? Math.round(((counts.get(c) ?? 0) / total) * 1000) / 10 : 0,
    }))
}

// ─── EVOLUÇÃO TEMPORAL ────────────────────────────────────────────────────────

export async function getEvolution(params: FilterParams): Promise<EvolutionDataPoint[]> {
  const { data = [] } = await applyFilters(
    supabase
      .from(TABLE)
      .select('session_start_at,pontuacao_total,avaliacao_pulada')
      .limit(50000),
    { ...params, incluirPuladas: 'true' }
  ) as { data: any[] }

  const byDate = new Map<string, { sumPontuacao: number; countAvaliados: number; total: number }>()

  for (const r of data ?? []) {
    const dateKey = (r.session_start_at as string)?.slice(0, 10) ?? ''
    const existing = byDate.get(dateKey) ?? { sumPontuacao: 0, countAvaliados: 0, total: 0 }
    existing.total++
    if (!r.avaliacao_pulada && r.pontuacao_total != null) {
      existing.sumPontuacao += Number(r.pontuacao_total)
      existing.countAvaliados++
    }
    byDate.set(dateKey, existing)
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, { sumPontuacao, countAvaliados, total }]) => ({
      data,
      pontuacao_media: countAvaliados > 0 ? Math.round((sumPontuacao / countAvaliados) * 10) / 10 : 0,
      total_atendimentos: total,
      total_avaliados: countAvaliados,
    }))
}

// ─── RANKING DE AGENTES ───────────────────────────────────────────────────────

export async function getAgentsRanking(params: FilterParams, limit = 10): Promise<AgentRanking[]> {
  const COLS = 'agent_name,agent_email,pontuacao_total,avaliacao_pulada,total_messages,advertencia_aplicada'
  const { data = [] } = await applyFilters(
    supabase.from(TABLE).select(COLS).limit(50000),
    { ...params, incluirPuladas: 'true' }
  ) as { data: any[] }

  const byAgent = new Map<string, {
    email: string; pontuacoes: number[]; mensagens: number[];
    totalAtendimentos: number; totalAvaliados: number; advertencias: number
  }>()

  for (const r of data ?? []) {
    const name = r.agent_name as string
    const ex = byAgent.get(name) ?? {
      email: r.agent_email ?? '',
      pontuacoes: [], mensagens: [],
      totalAtendimentos: 0, totalAvaliados: 0, advertencias: 0,
    }
    ex.totalAtendimentos++
    ex.mensagens.push(Number(r.total_messages ?? 0))
    if (!r.avaliacao_pulada && r.pontuacao_total != null) {
      ex.pontuacoes.push(Number(r.pontuacao_total))
      ex.totalAvaliados++
    }
    if (r.advertencia_aplicada) ex.advertencias++
    byAgent.set(name, ex)
  }

  return [...byAgent.entries()]
    .map(([name, { email, pontuacoes, mensagens, totalAtendimentos, totalAvaliados, advertencias }]) => ({
      agent_name: name,
      agent_email: email,
      total_atendimentos: totalAtendimentos,
      total_avaliados: totalAvaliados,
      pontuacao_media: avg(pontuacoes),
      media_mensagens: avg(mensagens),
      total_advertencias: advertencias,
    }))
    .filter((a) => a.total_avaliados > 0)
    .sort((a, b) => b.pontuacao_media - a.pontuacao_media)
    .slice(0, limit)
}

// ─── CRITÉRIOS APONTE ─────────────────────────────────────────────────────────

export async function getCriteriaPerformance(params: FilterParams): Promise<CriteriaPerformance[]> {
  const COLS = 'acolhimento_total,pesquisar_total,oferecer_total,negociar_total,tomar_iniciativa_total'
  const { data = [] } = await applyFilters(
    supabase.from(TABLE).select(COLS).limit(50000),
    params
  ) as { data: any[] }

  const rows = data ?? []
  const criteria = [
    { criterio: 'A', label: 'Acolhimento', key: 'acolhimento_total', maximo: 20 },
    { criterio: 'P', label: 'Pesquisar', key: 'pesquisar_total', maximo: 26 },
    { criterio: 'O', label: 'Oferecer', key: 'oferecer_total', maximo: 20 },
    { criterio: 'N', label: 'Negociar', key: 'negociar_total', maximo: 18 },
    { criterio: 'T', label: 'Tomar Iniciativa', key: 'tomar_iniciativa_total', maximo: 16 },
  ]

  return criteria.map(({ criterio, label, key, maximo }) => {
    const vals = rows.map((r: any) => Number(r[key] ?? 0)).filter((v: number) => v > 0)
    const obtido = avg(vals)
    return {
      criterio,
      label,
      obtido,
      maximo,
      percentual: maximo > 0 ? Math.round((obtido / maximo) * 100) : 0,
    }
  })
}

// ─── SCATTER: MENSAGENS × QUALIDADE ──────────────────────────────────────────

export async function getScatterData(params: FilterParams): Promise<ScatterDataPoint[]> {
  const COLS = 'total_messages,mensagens_cliente,mensagens_atendente,session_duration_minutes,pontuacao_total,classificacao'
  const { data = [] } = await applyFilters(
    supabase.from(TABLE).select(COLS).not('pontuacao_total', 'is', null).limit(2000),
    params
  ) as { data: any[] }

  return (data ?? []).map((r: any) => ({
    total_messages: Number(r.total_messages ?? 0),
    mensagens_cliente: Number(r.mensagens_cliente ?? 0),
    mensagens_atendente: Number(r.mensagens_atendente ?? 0),
    session_duration_minutes: Number(r.session_duration_minutes ?? 0),
    pontuacao_total: Number(r.pontuacao_total ?? 0),
    classificacao: r.classificacao ?? 'Regular',
  }))
}

// ─── MOTIVOS DE EXCLUSÃO ──────────────────────────────────────────────────────

export async function getExclusionReasons(params: FilterParams): Promise<ExclusionReason[]> {
  const { data = [] } = await applyFilters(
    supabase.from(TABLE).select('motivo_pulado').eq('avaliacao_pulada', true).limit(10000),
    { ...params, incluirPuladas: 'true' }
  ) as { data: any[] }

  const counts = new Map<string, number>()
  for (const r of data ?? []) {
    const motivo = (r.motivo_pulado as string) ?? 'Sem motivo'
    counts.set(motivo, (counts.get(motivo) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([motivo, count]) => ({ motivo, count }))
    .sort((a, b) => b.count - a.count)
}

// ─── LISTAGEM PAGINADA ────────────────────────────────────────────────────────

export async function getEvaluations(params: FilterParams): Promise<PaginatedEvaluations> {
  const page = parseInt(params.page ?? '1', 10)
  const limit = parseInt(params.limit ?? '20', 10)
  const from = (page - 1) * limit
  const to = from + limit - 1

  const allowedSorts = ['session_start_at', 'pontuacao_total', 'agent_name', 'contact_name', 'total_messages']
  const sortBy = allowedSorts.includes(params.sort_by ?? '') ? params.sort_by! : 'session_start_at'
  const ascending = params.sort_order === 'asc'

  const COLS = [
    'session_id', 'session_number', 'contact_name', 'contact_phone_formatted',
    'agent_name', 'session_start_at', 'total_messages', 'mensagens_cliente',
    'mensagens_atendente', 'session_duration_minutes', 'pontuacao_total',
    'classificacao', 'avaliacao_pulada', 'motivo_pulado', 'advertencia_aplicada', 'preview_url',
  ].join(',')

  const { data, count, error } = await applyFilters(
    supabase.from(TABLE).select(COLS, { count: 'exact' }),
    params
  ).order(sortBy, { ascending }).range(from, to)

  if (error) {
    console.error('[getEvaluations]', error)
    throw error
  }

  const total = count ?? 0
  return {
    data: (data ?? []) as PaginatedEvaluations['data'],
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  }
}

// ─── DETALHE COMPLETO ─────────────────────────────────────────────────────────

export async function getEvaluationById(id: string): Promise<AvaliacaoAPONTE | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('session_id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as AvaliacaoAPONTE
}

// ─── ANÁLISE ADVERTÊNCIAS ─────────────────────────────────────────────────────

export async function getWarnings(params: FilterParams): Promise<WarningAnalysis[]> {
  const COLS = [
    'advertencia_reclamacao_cliente', 'advertencia_falta_esclarecimento',
    'advertencia_promessas_nao_alinhadas', 'advertencia_conduta_inadequada',
    'advertencia_falta_entendimento', 'advertencia_demora_excessiva',
    'advertencia_descumprimento_processos',
  ].join(',')

  const { data = [] } = await applyFilters(
    supabase.from(TABLE).select(COLS).eq('advertencia_aplicada', true).limit(50000),
    params
  ) as { data: any[] }

  const rows = data ?? []
  const tipos = [
    { tipo: 'advertencia_reclamacao_cliente', label: 'Reclamação do Cliente' },
    { tipo: 'advertencia_falta_esclarecimento', label: 'Falta de Esclarecimento' },
    { tipo: 'advertencia_promessas_nao_alinhadas', label: 'Promessas não Alinhadas' },
    { tipo: 'advertencia_conduta_inadequada', label: 'Conduta Inadequada' },
    { tipo: 'advertencia_falta_entendimento', label: 'Falta de Entendimento' },
    { tipo: 'advertencia_demora_excessiva', label: 'Demora Excessiva' },
    { tipo: 'advertencia_descumprimento_processos', label: 'Descumprimento de Processos' },
  ]

  return tipos
    .map(({ tipo, label }) => {
      const count = rows.filter((r: any) => r[tipo] === true).length
      return {
        tipo,
        label,
        count,
        percentual: rows.length > 0 ? Math.round((count / rows.length) * 100) : 0,
      }
    })
    .filter((w) => w.count > 0)
    .sort((a, b) => b.count - a.count)
}

// ─── OPÇÕES PARA FILTROS ──────────────────────────────────────────────────────

export async function getFilterOptions(): Promise<{
  agentes: string[]
  departamentos: string[]
  motivosPulo: string[]
}> {
  const { data = [] } = await supabase
    .from(TABLE)
    .select('agent_name,department_name,motivo_pulado,avaliacao_pulada')
    .limit(10000)

  const rows = data ?? []
  const agentes = [...new Set(rows.map((r: any) => r.agent_name).filter(Boolean))].sort()
  const departamentos = [...new Set(rows.map((r: any) => r.department_name).filter(Boolean))].sort()
  const motivosPulo = [...new Set(
    rows.filter((r: any) => r.avaliacao_pulada).map((r: any) => r.motivo_pulado).filter(Boolean)
  )].sort()

  return { agentes, departamentos, motivosPulo }
}
