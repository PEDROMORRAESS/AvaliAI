'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, ChevronDown, ChevronUp, Search, Filter, RotateCcw } from 'lucide-react'
import { ActiveFilters, DEFAULT_FILTERS } from '@/types/dashboard'

interface FiltersSidebarProps {
  filters: ActiveFilters
  onChange: (f: ActiveFilters) => void
  collapsed?: boolean
  onCollapse?: () => void
}

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: '180d', label: 'Últimos 180 dias' },
  { value: '365d', label: 'Último ano' },
  { value: 'custom', label: 'Período customizado' },
]

const CLASSIFICACOES = ['Excelente', 'Bom', 'Regular', 'Ruim']

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-gray-100 pb-3 mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 hover:text-gray-700"
      >
        {title}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && children}
    </div>
  )
}

function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  placeholder: string
}) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  )

  function toggle(v: string) {
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v])
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white text-gray-600 hover:border-gray-300"
      >
        <span className="truncate">
          {selected.length === 0 ? placeholder : `${selected.length} selecionado${selected.length > 1 ? 's' : ''}`}
        </span>
        <ChevronDown size={12} className="text-gray-400 flex-shrink-0 ml-1" />
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 flex flex-col">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-1.5 text-xs border border-gray-200 rounded px-2 py-1">
              <Search size={11} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="flex-1 outline-none text-gray-700 bg-transparent"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 p-2 text-center">Nenhuma opção</p>
            ) : (
              filtered.map((o) => (
                <label
                  key={o}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(o)}
                    onChange={() => toggle(o)}
                    className="accent-blue-600 w-3 h-3"
                  />
                  <span className="text-xs text-gray-700 truncate">{o}</span>
                </label>
              ))
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-xs text-gray-400 hover:text-gray-600 py-1.5 border-t border-gray-100"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  )
}

export function FiltersSidebar({ filters, onChange, collapsed, onCollapse }: FiltersSidebarProps) {
  const [opts, setOpts] = useState<{ agentes: string[]; departamentos: string[]; motivosPulo: string[] }>({
    agentes: [], departamentos: [], motivosPulo: [],
  })

  useEffect(() => {
    fetch('/api/dashboard/filter-options')
      .then((r) => r.json())
      .then(setOpts)
      .catch(() => {})
  }, [])

  const set = useCallback(
    (key: keyof ActiveFilters, value: unknown) => {
      onChange({ ...filters, [key]: value })
    },
    [filters, onChange]
  )

  const activeCount = [
    filters.period !== '30d',
    filters.agentes.length > 0,
    filters.departamentos.length > 0,
    filters.clienteNome,
    filters.clienteTelefone,
    filters.classificacoes.length > 0,
    filters.apenasComAdvertencia,
    filters.incluirPuladas,
    filters.mensagensMinimas > 0,
    filters.mensagensMaximas > 0,
    filters.duracaoMinima > 0,
    filters.duracaoMaxima > 0,
  ].filter(Boolean).length

  if (collapsed) {
    return (
      <button
        onClick={onCollapse}
        className="flex flex-col items-center gap-2 w-10 pt-4 text-gray-400 hover:text-gray-700"
      >
        <Filter size={16} />
        {activeCount > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>
    )
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-200 h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-blue-600" />
          <span className="text-sm font-semibold text-gray-800">Filtros</span>
          {activeCount > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs rounded-full px-1.5 py-0.5 font-medium">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="text-gray-400 hover:text-gray-700 p-1 rounded"
            title="Limpar filtros"
          >
            <RotateCcw size={13} />
          </button>
          {onCollapse && (
            <button onClick={onCollapse} className="text-gray-400 hover:text-gray-700 p-1 rounded">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-0">
        {/* Período */}
        <Section title="Período">
          <select
            value={filters.period}
            onChange={(e) => set('period', e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1.5"
          >
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {filters.period === 'custom' && (
            <div className="space-y-1.5">
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">Início</label>
                <input
                  type="date"
                  value={filters.dataInicio}
                  onChange={(e) => set('dataInicio', e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">Fim</label>
                <input
                  type="date"
                  value={filters.dataFim}
                  onChange={(e) => set('dataFim', e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </Section>

        {/* Agente / Equipe */}
        <Section title="Agente / Equipe">
          {opts.agentes.length > 0 && (
            <div className="mb-2">
              <label className="text-xs text-gray-500 mb-1 block">Agentes</label>
              <MultiSelect
                options={opts.agentes}
                selected={filters.agentes}
                onChange={(v) => set('agentes', v)}
                placeholder="Todos os agentes"
              />
            </div>
          )}
          {opts.departamentos.length > 0 && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Departamentos</label>
              <MultiSelect
                options={opts.departamentos}
                selected={filters.departamentos}
                onChange={(v) => set('departamentos', v)}
                placeholder="Todos os deptos"
              />
            </div>
          )}
        </Section>

        {/* Cliente */}
        <Section title="Cliente">
          <div className="space-y-1.5">
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                value={filters.clienteNome}
                onChange={(e) => set('clienteNome', e.target.value)}
                placeholder="Nome do cliente..."
                className="w-full text-xs border border-gray-200 rounded-lg pl-7 pr-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                value={filters.clienteTelefone}
                onChange={(e) => set('clienteTelefone', e.target.value)}
                placeholder="Telefone..."
                className="w-full text-xs border border-gray-200 rounded-lg pl-7 pr-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Section>

        {/* Classificação */}
        <Section title="Classificação">
          <div className="flex flex-wrap gap-1.5">
            {CLASSIFICACOES.map((c) => {
              const selected = filters.classificacoes.includes(c)
              const colorMap: Record<string, string> = {
                Excelente: selected ? 'bg-green-600 text-white border-green-600' : 'border-green-200 text-green-700',
                Bom: selected ? 'bg-blue-600 text-white border-blue-600' : 'border-blue-200 text-blue-700',
                Regular: selected ? 'bg-amber-500 text-white border-amber-500' : 'border-amber-200 text-amber-700',
                Ruim: selected ? 'bg-red-600 text-white border-red-600' : 'border-red-200 text-red-700',
              }
              return (
                <button
                  key={c}
                  onClick={() => {
                    const newVal = selected
                      ? filters.classificacoes.filter((x) => x !== c)
                      : [...filters.classificacoes, c]
                    set('classificacoes', newVal)
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${colorMap[c]}`}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </Section>

        {/* Métricas */}
        <Section title="Métricas">
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Mensagens (mín – máx)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  value={filters.mensagensMinimas || ''}
                  onChange={(e) => set('mensagensMinimas', Number(e.target.value))}
                  placeholder="Min"
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400 text-xs">–</span>
                <input
                  type="number"
                  min={0}
                  value={filters.mensagensMaximas || ''}
                  onChange={(e) => set('mensagensMaximas', Number(e.target.value))}
                  placeholder="Máx"
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Duração min (mín – máx)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  value={filters.duracaoMinima || ''}
                  onChange={(e) => set('duracaoMinima', Number(e.target.value))}
                  placeholder="Min"
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400 text-xs">–</span>
                <input
                  type="number"
                  min={0}
                  value={filters.duracaoMaxima || ''}
                  onChange={(e) => set('duracaoMaxima', Number(e.target.value))}
                  placeholder="Máx"
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Advertências / Avaliação */}
        <Section title="Avaliação">
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.apenasComAdvertencia}
                onChange={(e) => set('apenasComAdvertencia', e.target.checked)}
                className="accent-red-600 w-3.5 h-3.5"
              />
              <span className="text-xs text-gray-700">Apenas com advertência</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.incluirPuladas}
                onChange={(e) => set('incluirPuladas', e.target.checked)}
                className="accent-blue-600 w-3.5 h-3.5"
              />
              <span className="text-xs text-gray-700">Incluir avaliações puladas</span>
            </label>

            {filters.incluirPuladas && opts.motivosPulo.length > 0 && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Motivo do pulo</label>
                <MultiSelect
                  options={opts.motivosPulo}
                  selected={filters.motivosPulo}
                  onChange={(v) => set('motivosPulo', v)}
                  placeholder="Todos os motivos"
                />
              </div>
            )}
          </div>
        </Section>
      </div>
    </aside>
  )
}
