import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FoodItem } from '@/lib/types'
import FoodList from '@/components/FoodList'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: foods } = await supabase
    .from('food_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('expiry_date', { ascending: true })

  const allFoods = foods ?? []
  const now = new Date().setHours(0, 0, 0, 0)
  const expiredCount = allFoods.filter(f => new Date(f.expiry_date).setHours(0,0,0,0) < now).length
  const soonCount = allFoods.filter(f => {
    const d = Math.floor((new Date(f.expiry_date).setHours(0,0,0,0) - now) / 86400000)
    return d >= 0 && d <= 3
  }).length

  return (
    <div>
      {/* サマリーカード */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div className="rounded-2xl p-4 text-center" style={{ flex: 1, backgroundColor: '#FFFEFA', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <p className="text-2xl font-black" style={{ color: '#3F5F4B' }}>{allFoods.length}</p>
          <p className="text-xs font-medium mt-1" style={{ color: '#8FA898' }}>登録食材</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ flex: 1, backgroundColor: '#FFFCF4', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <p className="text-2xl font-black" style={{ color: '#9A7030' }}>{soonCount}</p>
          <p className="text-xs font-medium mt-1" style={{ color: '#B89858' }}>期限間近</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ flex: 1, backgroundColor: '#FFF8F8', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <p className="text-2xl font-black" style={{ color: '#B85555' }}>{expiredCount}</p>
          <p className="text-xs font-medium mt-1" style={{ color: '#C87878' }}>期限切れ</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ color: '#3F5F4B' }}>
          冷蔵庫の中身
        </h2>
        <Link
          href="/add"
          className="text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md hover:opacity-90"
          style={{ backgroundColor: '#4F7A62' }}
        >
          + 追加
        </Link>
      </div>

      <FoodList foods={allFoods as FoodItem[]} userId={user.id} />
    </div>
  )
}
