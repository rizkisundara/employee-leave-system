import supabase from '@/lib/supabase'
import { toCamelCase, toSnakeCase } from '@/lib/case-utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data, error } = await supabase.from('employees').select('*').order('name')
    if (error) throw error
    return NextResponse.json(toCamelCase(data))
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, error } = await supabase.from('employees').insert(toSnakeCase(body)).select().single()
    if (error) throw error
    // Create leave quota for current year
    const year = new Date().getFullYear()
    await supabase.from('leave_quotas').insert({ employee_id: data.id, year, total_quota: 12 })
    return NextResponse.json(toCamelCase(data), { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
