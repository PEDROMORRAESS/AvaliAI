export type Classificacao = 'Excelente' | 'Bom' | 'Regular' | 'Ruim' | 'Não Avaliado'

export interface AvaliacaoAPONTE {
  // Sessão
  session_id: string
  session_number: string
  contact_id: string
  contact_name: string
  contact_phone: string
  contact_phone_formatted: string
  agent_id: string
  agent_name: string
  agent_email: string
  department_id: string
  department_name: string
  company_id: string
  channel_type: string
  channel_platform: string
  session_start_at: string
  session_end_at: string
  session_duration_minutes: number
  last_interaction_date: string
  total_messages: number
  unread_count: number
  preview_url: string

  // Métricas
  mensagens_cliente: number
  mensagens_atendente: number
  conversa_formatada: string
  total_audios_transcritos: number

  // Controle
  avaliacao_pulada: boolean
  motivo_pulado: string | null

  // APONTE — Acolhimento
  acolhimento_saudacao_inicial: number | null
  acolhimento_pergunta_nome: number | null
  acolhimento_uso_nome: number | null
  acolhimento_total: number | null
  acolhimento_comentarios: string | null

  // APONTE — Pesquisar
  pesquisar_escuta_ativa: number | null
  pesquisar_linguagem_empatica: number | null
  pesquisar_tempo_resposta: number | null
  pesquisar_identificacao_necessidades: number | null
  pesquisar_total: number | null
  pesquisar_comentarios: string | null

  // APONTE — Oferecer
  oferecer_conhecimento_produto: number | null
  oferecer_sugestoes_produtos: number | null
  oferecer_lidar_objecoes: number | null
  oferecer_total: number | null
  oferecer_comentarios: string | null

  // APONTE — Negociar
  negociar_capacidade_convencimento: number | null
  negociar_construcao_relacionamento: number | null
  negociar_total: number | null
  negociar_comentarios: string | null

  // APONTE — Tomar Iniciativa
  tomar_iniciativa_verificacao_final: number | null
  tomar_iniciativa_agradecimento_despedida: number | null
  tomar_iniciativa_total: number | null
  tomar_iniciativa_comentarios: string | null

  pontuacao_total: number | null
  classificacao: string

  pontos_positivos: string | null
  pontos_melhoria: string | null
  observacoes_gerais: string | null

  // Advertências
  advertencia_reclamacao_cliente: boolean | null
  advertencia_falta_esclarecimento: boolean | null
  advertencia_promessas_nao_alinhadas: boolean | null
  advertencia_conduta_inadequada: boolean | null
  advertencia_falta_entendimento: boolean | null
  advertencia_demora_excessiva: boolean | null
  advertencia_descumprimento_processos: boolean | null
  advertencia_aplicada: boolean | null
  advertencia_motivo: string | null

  created_at: string
  updated_at: string
}

// ─── Filtros ──────────────────────────────────────────────────────────────────

export interface ActiveFilters {
  period: string           // '7d' | '30d' | '90d' | '180d' | '365d' | 'custom'
  dataInicio: string
  dataFim: string
  agentes: string[]
  departamentos: string[]
  clienteNome: string
  clienteTelefone: string
  mensagensMinimas: number
  mensagensMaximas: number
  duracaoMinima: number
  duracaoMaxima: number
  classificacoes: string[]
  apenasComAdvertencia: boolean
  advertenciaTipo: string     // campo específico, ex: 'advertencia_demora_excessiva'
  incluirPuladas: boolean
  motivosPulo: string[]
}

export const DEFAULT_FILTERS: ActiveFilters = {
  period: '30d',
  dataInicio: '',
  dataFim: '',
  agentes: [],
  departamentos: [],
  clienteNome: '',
  clienteTelefone: '',
  mensagensMinimas: 0,
  mensagensMaximas: 0,
  duracaoMinima: 0,
  duracaoMaxima: 0,
  classificacoes: [],
  apenasComAdvertencia: false,
  advertenciaTipo: '',
  incluirPuladas: false,
  motivosPulo: [],
}

// ─── Resumo / KPIs ────────────────────────────────────────────────────────────

export interface ResumoGeral {
  total_atendimentos: number
  total_avaliados: number
  total_pulados: number
  media_geral: number
  media_mensagens: number
  media_msgs_cliente: number
  media_msgs_atendente: number
  media_duracao: number
  total_advertencias: number
  top_advertencias: { tipo: string; label: string; count: number }[]
}

// ─── Gráficos ─────────────────────────────────────────────────────────────────

export interface ClassificationData {
  classificacao: string
  count: number
  percentual: number
}

export interface EvolutionDataPoint {
  data: string
  pontuacao_media: number
  total_atendimentos: number
  total_avaliados: number
}

export interface AgentRanking {
  agent_name: string
  agent_email: string
  total_atendimentos: number
  total_avaliados: number
  pontuacao_media: number
  media_mensagens: number
  total_advertencias: number
}

export interface CriteriaPerformance {
  criterio: string
  label: string
  obtido: number
  maximo: number
  percentual: number
}

export interface ScatterDataPoint {
  total_messages: number
  mensagens_cliente: number
  mensagens_atendente: number
  session_duration_minutes: number
  pontuacao_total: number
  classificacao: string
}

export interface ExclusionReason {
  motivo: string
  count: number
}

// ─── Tabela ───────────────────────────────────────────────────────────────────

export interface EvaluationListItem {
  session_id: string
  session_number: string
  contact_name: string
  contact_phone_formatted: string
  agent_name: string
  session_start_at: string
  total_messages: number
  mensagens_cliente: number
  mensagens_atendente: number
  session_duration_minutes: number
  pontuacao_total: number | null
  classificacao: string
  avaliacao_pulada: boolean
  motivo_pulado: string | null
  advertencia_aplicada: boolean | null
  preview_url: string | null
}

export interface PaginatedEvaluations {
  data: EvaluationListItem[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// ─── Advertências ─────────────────────────────────────────────────────────────

export interface WarningAnalysis {
  tipo: string
  label: string
  count: number
  percentual: number
}

// ─── Tipos de filtro para API ─────────────────────────────────────────────────

export interface FilterParams {
  period?: string
  dataInicio?: string
  dataFim?: string
  agentes?: string          // CSV
  departamentos?: string    // CSV
  clienteNome?: string
  clienteTelefone?: string
  mensagensMinimas?: string
  mensagensMaximas?: string
  duracaoMinima?: string
  duracaoMaxima?: string
  classificacoes?: string   // CSV
  apenasComAdvertencia?: string
  advertenciaTipo?: string
  incluirPuladas?: string
  motivosPulo?: string      // CSV
  page?: string
  limit?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}
