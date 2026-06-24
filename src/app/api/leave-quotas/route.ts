import supabase from '@/lib/supabase'
import { toCamelCase, toSnakeCase } from '@/lib/case-utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    let query = supabase.from('leave_quotas').select('*')
    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(toCamelCase(data))
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
