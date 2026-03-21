export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getFilterOptions } from '@/lib/queries'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await getFilterOptions()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API /filter-options]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
