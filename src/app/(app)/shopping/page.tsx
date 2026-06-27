import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FoodItem } from '@/lib/types'
import ShoppingList from '@/components/ShoppingList'

export default async function ShoppingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: foods } = await supabase
    .from('food_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'shopping')
    .order('name', { ascending: true })

  return (
    <div>
      <h2 className="text-xl font-black mb-6" style={{ color: '#3F5F4B' }}>買い物リスト</h2>
      <ShoppingList foods={foods as FoodItem[] ?? []} />
    </div>
  )
}
