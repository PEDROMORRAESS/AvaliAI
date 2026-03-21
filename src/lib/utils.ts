import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Classificacao } from '@/types/dashboard'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function safeDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null
  const d = typeof date === 'string' ? new Date(date) : date
  return isNaN(d.getTime()) ? null : d
}

export function formatDate(date: string | Date | null | undefined): string {
  const d = safeDate(date)
  if (!d) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function formatDateTime(date: string | Date | null | undefined): string {
  const d = safeDate(date)
  if (!d) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatNumber(n: number, decimals = 1): string {
  return n.toFixed(decimals).replace('.', ',')
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1).replace('.', ',')}%`
}

export function getClassificacaoColor(c: string): string {
  const map: Record<string, string> = {
    Excelente: '#10b981',
    Bom: '#3b82f6',
    Regular: '#f59e0b',
    Ruim: '#ef4444',
    'Não Avaliado': '#6b7280',
  }
  return map[c] ?? '#6b7280'
}

export function getClassificacaoBadgeClass(c: string): string {
  const map: Record<string, string> = {
    Excelente: 'bg-green-100 text-green-700',
    Bom: 'bg-blue-100 text-blue-700',
    Regular: 'bg-amber-100 text-amber-700',
    Ruim: 'bg-red-100 text-red-700',
    'Não Avaliado': 'bg-gray-100 text-gray-500',
  }
  return map[c] ?? 'bg-gray-100 text-gray-500'
}

export function calcDelta(current: number, previous: number): number {
  if (!previous) return 0
  return Math.round(((current - previous) / previous) * 100 * 10) / 10
}

// Converte period string em start/end Date
export function periodToDateRange(period: string): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()
  const days = { '7d': 7, '30d': 30, '90d': 90, '180d': 180, '365d': 365 }[period] ?? 30
  start.setDate(end.getDate() - days)
  return { start, end }
}
