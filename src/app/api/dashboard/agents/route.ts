export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAgentsRanking } from '@/lib/queries'
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
      departamentos: s.get('departamentos') ?? undefined,
    }
    const data = await getAgentsRanking(params, parseInt(s.get('limit') ?? '10', 10))
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API /agents]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
