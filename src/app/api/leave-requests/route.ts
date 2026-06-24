import supabase from '@/lib/supabase'
import { toCamelCase, toSnakeCase } from '@/lib/case-utils'
import { NextRequest, NextResponse } from 'next/server'

function calculateWorkingDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  let count = 0
  const current = new Date(start)
  while (current <= end) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  return count
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*, employees(name, department)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(toCamelCase(data))
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json()
    const body = toSnakeCase(rawBody)
    const days_count = calculateWorkingDays(body.start_date || rawBody.startDate, body.end_date || rawBody.endDate)
    const { data, error } = await supabase
      .from('leave_requests')
      .insert({ ...body, days_count })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(toCamelCase(data), { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
