export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getClassifications } from '@/lib/queries'
import { FilterParams } from '@/types/dashboard'

function buildParams(s: URLSearchParams): FilterParams {
  return {
    period: s.get('period') ?? '30d',
    dataInicio: s.get('dataInicio') ?? undefined,
    dataFim: s.get('dataFim') ?? undefined,
    agentes: s.get('agentes') ?? undefined,
    departamentos: s.get('departamentos') ?? undefined,
    incluirPuladas: s.get('incluirPuladas') ?? 'false',
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const data = await getClassifications(buildParams(req.nextUrl.searchParams))
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API /classifications]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
