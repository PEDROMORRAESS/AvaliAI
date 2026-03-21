'use client'

import { AlertTriangle, CheckCircle } from 'lucide-react'
import { WarningAnalysis } from '@/types/dashboard'

interface Props {
  data: WarningAnalysis[]
  loading: boolean
  activeWarningTipo?: string | null
  onCardClick?: (tipo: string) => void
}

export function WarningsGrid({ data, loading, activeWarningTipo, onCardClick }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-red-500" />
        <h2 className="text-sm font-semibold text-gray-800">Análise de Advertências</h2>
        {onCardClick && data.length > 0 && (
          <span className="text-xs text-gray-400 ml-auto">Clique para filtrar a tabela</span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          Nenhuma advertência no período selecionado
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.map((w) => {
            const isActive = activeWarningTipo === w.tipo
            return (
              <div
                key={w.tipo}
                onClick={() => onCardClick?.(w.tipo)}
                className={`relative border-2 rounded-xl p-3 transition-all duration-200 ${
                  onCardClick ? 'cursor-pointer' : 'cursor-default'
                } ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-100'
                    : 'border-red-100 bg-red-50/50 hover:border-red-300 hover:bg-red-50 hover:shadow-sm'
                }`}
              >
                {isActive && (
                  <CheckCircle
                    size={16}
                    className="absolute top-2 right-2 text-blue-600"
                  />
                )}
                <p className={`text-2xl font-bold tabular-nums ${isActive ? 'text-blue-700' : 'text-red-600'}`}>
                  {w.count}
                </p>
                <p className={`text-xs mt-0.5 leading-tight ${isActive ? 'text-blue-700' : 'text-gray-600'}`}>
                  {w.label}
                </p>
                <div className="mt-2 w-full bg-red-100 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${isActive ? 'bg-blue-400' : 'bg-red-400'}`}
                    style={{ width: `${w.percentual}%` }}
                  />
                </div>
                <p className={`text-xs mt-0.5 ${isActive ? 'text-blue-500' : 'text-red-400'}`}>
                  {w.percentual}% do total
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
