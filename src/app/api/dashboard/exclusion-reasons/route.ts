export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getExclusionReasons } from '@/lib/queries'
import { FilterParams } from '@/types/dashboard'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
