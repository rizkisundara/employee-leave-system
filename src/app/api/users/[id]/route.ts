import supabase from '@/lib/supabase'
import { toCamelCase, toSnakeCase } from '@/lib/case-utils'
import { NextRequest, NextResponse } from 'next/server'

const USER_COLUMNS = 'id, username, name, email, role, status, avatar, last_login, employee_id, created_at, updated_at'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase.from('app_users').select(USER_COLUMNS).eq('id', id).single()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'User not found' }, { status: 404 })
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
    const body = toSnakeCase(await request.json())

    // If password is empty string, remove it from update data
    if (body.password === '') {
      delete body.password
    }

    const { data, error } = await supabase.from('app_users').update(body).eq('id', id).select(USER_COLUMNS).single()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'User not found' }, { status: 404 })
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
    const { error } = await supabase.from('app_users').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
