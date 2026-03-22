export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getFilterOptions } from '@/lib/queries'

export async function GET() {
  try {

    const data = await getFilterOptions()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API /filter-options]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
