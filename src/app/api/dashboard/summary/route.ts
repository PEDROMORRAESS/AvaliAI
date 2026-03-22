export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getResumo } from '@/lib/queries'
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
      incluirPuladas: s.get('incluirPuladas') ?? 'false',
    }

    const data = await getResumo(params)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API /summary]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
