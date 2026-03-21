'use client'

import { useEffect, useRef } from 'react'
import { X, Mic, User, Headphones } from 'lucide-react'
import { AvaliacaoAPONTE } from '@/types/dashboard'
import { formatDateTime } from '@/lib/utils'

interface Props {
  evaluation: AvaliacaoAPONTE | null
  onClose: () => void
}

interface MensagemParsed {
  timestamp: string
  autor: string
  tipo: 'cliente' | 'atendente' | 'sistema'
  conteudo: string
  isAudio: boolean
}

function parseConversa(raw: string): MensagemParsed[] {
  if (!raw) return []

  // Tenta detectar padrões comuns de conversa formatada
  const lines = raw.split('\n').filter((l) => l.trim())
  const msgs: MensagemParsed[] = []

  for (const line of lines) {
    // Padrão: "[HH:MM] Nome: mensagem" ou similar
    const match = line.match(/^(?:\[(\d{2}:\d{2}(?::\d{2})?)\]\s*)?([^:]+):\s*(.+)$/)
    if (match) {
      const [, time, autor, conteudo] = match
      const autorLower = autor.trim().toLowerCase()
      const tipo = autorLower.includes('cliente') || autorLower.includes('client')
        ? 'cliente'
        : autorLower.includes('sistema') || autorLower.includes('bot')
        ? 'sistema'
        : 'atendente'

      msgs.push({
        timestamp: time ?? '',
        autor: autor.trim(),
        tipo,
        conteudo: conteudo.trim(),
        isAudio: conteudo.toLowerCase().includes('[áudio') || conteudo.toLowerCase().includes('[audio'),
      })
    } else if (line.trim()) {
      // Linha sem padrão reconhecido — trata como mensagem genérica
      msgs.push({
        timestamp: '',
        autor: '',
        tipo: 'sistema',
        conteudo: line.trim(),
        isAudio: false,
      })
    }
  }

  return msgs.length > 0 ? msgs : [{ timestamp: '', autor: '', tipo: 'sistema', conteudo: raw, isAudio: false }]
}

function Bubble({ msg }: { msg: MensagemParsed }) {
  if (msg.tipo === 'sistema') {
    return (
      <div className="flex justify-center my-1">
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">{msg.conteudo}</span>
      </div>
    )
  }

  const isCliente = msg.tipo === 'cliente'
  return (
    <div className={`flex gap-2 ${isCliente ? 'justify-start' : 'justify-end'}`}>
      {isCliente && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
          <User size={12} className="text-blue-600" />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 ${
          isCliente
            ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
            : 'bg-blue-600 text-white rounded-tr-sm'
        }`}
      >
        {msg.autor && (
          <p className={`text-xs font-semibold mb-0.5 ${isCliente ? 'text-gray-500' : 'text-blue-200'}`}>
            {msg.autor}
          </p>
        )}
        {msg.isAudio ? (
          <div className="flex items-center gap-1.5">
            <Mic size={12} className={isCliente ? 'text-blue-500' : 'text-blue-200'} />
            <span className="text-sm italic">{msg.conteudo}</span>
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.conteudo}</p>
        )}
        {msg.timestamp && (
          <p className={`text-xs mt-0.5 text-right ${isCliente ? 'text-gray-400' : 'text-blue-300'}`}>
            {msg.timestamp}
          </p>
        )}
      </div>
      {!isCliente && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
          <Headphones size={12} className="text-white" />
        </div>
      )}
    </div>
  )
}

export function ConversationModal({ evaluation, onClose }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (evaluation) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [evaluation])

  if (!evaluation) return null

  const mensagens = parseConversa(evaluation.conversa_formatada ?? '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Conversa Completa</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {evaluation.contact_name} · {evaluation.agent_name} · {formatDateTime(evaluation.session_start_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-400">{evaluation.total_messages} msgs</p>
              {evaluation.total_audios_transcritos > 0 && (
                <p className="text-xs text-purple-600 flex items-center gap-0.5 justify-end">
                  <Mic size={10} /> {evaluation.total_audios_transcritos} áudios
                </p>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50/50">
          {mensagens.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-gray-400">
              Conversa não disponível
            </div>
          ) : (
            mensagens.map((msg, i) => <Bubble key={i} msg={msg} />)
          )}
          <div ref={bottomRef} />
        </div>

        {/* Footer stats */}
        <div className="px-5 py-3 border-t border-gray-200 bg-white flex items-center justify-between text-xs text-gray-500">
          <span>{evaluation.mensagens_cliente} msgs do cliente</span>
          <span>{evaluation.mensagens_atendente} msgs do atendente</span>
          <span>{evaluation.session_duration_minutes} min</span>
        </div>
      </div>
    </div>
  )
}
