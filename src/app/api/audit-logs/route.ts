import supabase from '@/lib/supabase'
import { toCamelCase, toSnakeCase } from '@/lib/case-utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
    if (error) throw error
    return NextResponse.json(toCamelCase(data))
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, error } = await supabase.from('audit_logs').insert(toSnakeCase(body)).select().single()
    if (error) throw error
    return NextResponse.json(toCamelCase(data), { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
