'use client'

import { PanelLeftClose, PanelLeft } from 'lucide-react'

interface HeaderProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm h-14 flex items-center px-4 gap-3">
      <button
        onClick={onToggleSidebar}
        className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        title={sidebarOpen ? 'Fechar filtros' : 'Abrir filtros'}
      >
        {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
      </button>

      <div className="flex items-center gap-2.5">
        <img src="/logo.png" alt="AvaliaAI" className="w-8 h-8 object-contain flex-shrink-0" />
        <div className="hidden sm:block">
          <p className="text-xs text-gray-400 leading-none">Fazendão Materiais de Construção</p>
          <h1 className="text-sm font-bold text-gray-900">AvaliaAI</h1>
        </div>
      </div>
    </header>
  )
}
