export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getEvaluationById } from '@/lib/queries'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const { id } = params
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

    const data = await getEvaluationById(id)
    if (!data) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    return NextResponse.json(data)
  } catch (error) {
    console.error('[API /evaluation/:id]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
