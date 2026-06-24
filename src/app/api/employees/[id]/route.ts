import supabase from '@/lib/supabase'
import { toCamelCase, toSnakeCase } from '@/lib/case-utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase.from('employees').select('*').eq('id', id).single()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
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
    const { data, error } = await supabase.from('employees').update(toSnakeCase(body)).eq('id', id).select().single()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    return NextResponse.json(toCamelCase(data))
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabase.from('employees').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ message: 'Employee deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
