import supabase from '@/lib/supabase'
import { toCamelCase, toSnakeCase } from '@/lib/case-utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*, employees(name, department)')
      .eq('id', id)
      .single()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    return NextResponse.json(toCamelCase(data))
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const snakeBody = toSnakeCase(body)
    const updateData: Record<string, any> = {}
    if (snakeBody.status !== undefined) updateData.status = snakeBody.status
    if (snakeBody.approved_by !== undefined) updateData.approved_by = snakeBody.approved_by
    if (snakeBody.review_note !== undefined) updateData.review_note = snakeBody.review_note

    const { data, error } = await supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    return NextResponse.json(toCamelCase(data))
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
