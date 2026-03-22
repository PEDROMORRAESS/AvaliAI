export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getExclusionReasons } from '@/lib/queries'
import { FilterParams } from '@/types/dashboard'

export async function GET(req: NextRequest) {
  try {

    const s = req.nextUrl.searchParams
    const params: FilterParams = {
      period: s.get('period') ?? '30d',
      dataInicio: s.get('dataInicio') ?? undefined,
      dataFim: s.get('dataFim') ?? undefined,
      agentes: s.get('agentes') ?? undefined,
    }

    const data = await getExclusionReasons(params)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API /exclusion-reasons]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
