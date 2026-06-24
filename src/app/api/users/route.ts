import supabase from '@/lib/supabase'
import { toCamelCase, toSnakeCase } from '@/lib/case-utils'
import { NextRequest, NextResponse } from 'next/server'

const USER_COLUMNS = 'id, username, name, email, role, status, avatar, last_login, employee_id, created_at, updated_at'

export async function GET() {
  try {
    const { data, error } = await supabase.from('app_users').select(USER_COLUMNS).order('name')
    if (error) throw error
    return NextResponse.json(toCamelCase(data))
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = toSnakeCase(await request.json())

    // Check for duplicate username
    const { data: existing, error: checkError } = await supabase
      .from('app_users')
      .select('id')
      .eq('username', body.username)
      .maybeSingle()
    if (checkError) throw checkError
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }

    const { data, error } = await supabase.from('app_users').insert(body).select(USER_COLUMNS).single()
    if (error) throw error
    return NextResponse.json(toCamelCase(data), { status: 201 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
