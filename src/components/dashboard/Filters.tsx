'use client'

import { useEffect, useState } from 'react'
import { Filter, X } from 'lucide-react'

interface FiltersProps {
  onFilterChange: (filters: ActiveFilters) => void
}

export interface ActiveFilters {
  agent: string
  department: string
  classificacao: string[]
  com_advertencia: string
  canal: string
}

const CLASSIFICACOES = ['Excelente', 'Bom', 'Regular', 'Ruim']

export function Filters({ onFilterChange }: FiltersProps) {
  const [open, setOpen] = useState(false)
  const [agents, setAgents] = useState<string[]>([])
  const [departments, setDepartments] = useState<string[]>([])

  const [agent, setAgent] = useState('')
  const [department, setDepartment] = useState('')
  const [classificacoes, setClassificacoes] = useState<string[]>([])
  const [comAdvertencia, setComAdvertencia] = useState('')
  const [canal, setCanal] = useState('')

  useEffect(() => {
    fetch('/api/dashboard/agents?limit=100')
      .then((r) => r.json())
      .then((d: { agent_name: string }[]) => setAgents(d.map((a) => a.agent_name)))
      .catch(() => {})
    fetch('/api/dashboard/evaluations?limit=1')
      .then(() => {})
      .catch(() => {})
  }, [])

  const activeCount = [agent, department, classificacoes.length > 0, comAdvertencia, canal].filter(Boolean).length

  function apply() {
    onFilterChange({
      agent,
      department,
      classificacao: classificacoes,
      com_advertencia: comAdvertencia,
      canal,
    })
    setOpen(false)
  }

  function reset() {
    setAgent('')
    setDepartment('')
    setClassificacoes([])
    setComAdvertencia('')
    setCanal('')
    onFilterChange({ agent: '', department: '', classificacao: [], com_advertencia: '', canal: '' })
    setOpen(false)
  }

  function toggleClassificacao(c: string) {
    setClassificacoes((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
      >
        <Filter size={14} />
        Filtros
        {activeCount > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">Filtros</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>

          {/* Agente */}
          {agents.length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Agente</label>
              <select
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {agents.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}

          {/* Classificação */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Classificação</label>
            <div className="flex flex-wrap gap-1.5">
              {CLASSIFICACOES.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleClassificacao(c)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    classificacoes.includes(c)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Advertência */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Advertência</label>
            <select
              value={comAdvertencia}
              onChange={(e) => setComAdvertencia(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="true">Com advertência</option>
              <option value="false">Sem advertência</option>
            </select>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={reset}
              className="flex-1 text-sm py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={apply}
              className="flex-1 text-sm py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
