export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getEvaluations } from '@/lib/queries'
import { FilterParams } from '@/types/dashboard'

export async function GET(req: NextRequest) {
  try {

    const s = req.nextUrl.searchParams
    const params: FilterParams = {
      period: s.get('period') ?? '30d',
      dataInicio: s.get('dataInicio') ?? undefined,
      dataFim: s.get('dataFim') ?? undefined,
      agentes: s.get('agentes') ?? undefined,
      departamentos: s.get('departamentos') ?? undefined,
      clienteNome: s.get('clienteNome') ?? undefined,
      clienteTelefone: s.get('clienteTelefone') ?? undefined,
      classificacoes: s.get('classificacoes') ?? undefined,
      apenasComAdvertencia: s.get('apenasComAdvertencia') ?? undefined,
      advertenciaTipo: s.get('advertenciaTipo') ?? undefined,
      incluirPuladas: s.get('incluirPuladas') ?? 'false',
      motivosPulo: s.get('motivosPulo') ?? undefined,
      mensagensMinimas: s.get('mensagensMinimas') ?? undefined,
      mensagensMaximas: s.get('mensagensMaximas') ?? undefined,
      duracaoMinima: s.get('duracaoMinima') ?? undefined,
      duracaoMaxima: s.get('duracaoMaxima') ?? undefined,
      page: s.get('page') ?? '1',
      limit: s.get('limit') ?? '20',
      sort_by: s.get('sort_by') ?? undefined,
      sort_order: (s.get('sort_order') as 'asc' | 'desc') ?? undefined,
    }

    const data = await getEvaluations(params)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API /evaluations]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
