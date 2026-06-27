import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FoodItem } from '@/lib/types'
import ShoppingList from '@/components/ShoppingList'

export default async function ShoppingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [foodsResult, mastersResult] = await Promise.all([
    supabase
      .from('food_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'shopping')
      .order('name', { ascending: true }),
    supabase
      .from('master_foods')
      .select('name, category')
      .or(`user_id.is.null,user_id.eq.${user.id}`),
  ])

  const masterMap = new Map(
    (mastersResult.data ?? []).map(m => [m.name, m.category])
  )

  const foods = (foodsResult.data ?? []).map(f => ({
    ...(f as FoodItem),
    resolvedCategory: masterMap.get(f.name) ?? 'その他',
  }))

  return (
    <div>
      <h2 className="text-xl font-black mb-6" style={{ color: '#3F5F4B' }}>買い物リスト</h2>
      <ShoppingList foods={foods} />
    </div>
  )
}
