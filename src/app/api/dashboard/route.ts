import supabase from '@/lib/supabase'
import { toCamelCase, toSnakeCase } from '@/lib/case-utils'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Count employees
    const { count: totalEmployees, error: empError } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })
    if (empError) throw empError

    // Count pending leaves (PENDING_MANAGER or PENDING_HR)
    const { count: pendingLeaves, error: pendingError } = await supabase
      .from('leave_requests')
      .select('id', { count: 'exact', head: true })
      .in('status', ['PENDING_MANAGER', 'PENDING_HR'])
    if (pendingError) throw pendingError

    // Count approved leaves
    const { count: approvedLeaves, error: approvedError } = await supabase
      .from('leave_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'APPROVED')
    if (approvedError) throw approvedError

    // Count rejected leaves
    const { count: rejectedLeaves, error: rejectedError } = await supabase
      .from('leave_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'REJECTED')
    if (rejectedError) throw rejectedError

    // Count users
    const { count: totalUsers, error: usersError } = await supabase
      .from('app_users')
      .select('id', { count: 'exact', head: true })
    if (usersError) throw usersError

    return NextResponse.json({
      totalEmployees: totalEmployees ?? 0,
      pendingLeaves: pendingLeaves ?? 0,
      approvedLeaves: approvedLeaves ?? 0,
      rejectedLeaves: rejectedLeaves ?? 0,
      totalUsers: totalUsers ?? 0,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
