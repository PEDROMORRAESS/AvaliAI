export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getEvaluationById } from '@/lib/queries'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
