import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { planId, amount } = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Insert subscription
  const { data, error } = await supabase.from('subscriptions').insert({
    user_id: user.id,
    plan_id: planId,
    amount,
  }).select()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Note: Pas de transaction négative car l'investissement vient de fonds externes
  // Le solde investi sera calculé directement depuis les souscriptions actives

  return NextResponse.json({ success: true, subscription: data[0] })
}
