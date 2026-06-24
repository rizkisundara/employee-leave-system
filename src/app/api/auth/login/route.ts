import supabase from '@/lib/supabase'
import { toCamelCase, toSnakeCase } from '@/lib/case-utils'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    // Query user by username (include password for comparison)
    const { data: user, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', username)
      .maybeSingle()
    if (error) throw error

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    // Compare password (plain text)
    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Account is not active' }, { status: 401 })
    }

    // Update last_login
    await supabase
      .from('app_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Create audit log
    await supabase.from('audit_logs').insert({
      action: 'LOGIN',
      performed_by: user.id,
      target_id: user.id,
      target_type: 'USER',
      details: `User ${user.username} logged in`,
    })

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(toCamelCase(userWithoutPassword))
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
