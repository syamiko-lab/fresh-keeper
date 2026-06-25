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
    .order('expiry_date', { ascending: true })

  const allFoods = foods ?? []
  const now = new Date().setHours(0, 0, 0, 0)
  const expiredCount = allFoods.filter(f => new Date(f.expiry_date).setHours(0,0,0,0) < now).length
  const soonCount = allFoods.filter(f => {
    const d = Math.floor((new Date(f.expiry_date).setHours(0,0,0,0) - now) / 86400000)
    return d >= 0 && d <= 3
  }).length

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F7F2' }}>
      <header className="px-4 py-4 sticky top-0 z-10" style={{ backgroundColor: '#FFFEFA', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥦</span>
            <h1 className="text-xl font-black" style={{ color: '#3F5F4B' }}>Fresh Keeper</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/master" className="text-sm font-medium transition-colors" style={{ color: '#6B7F73' }}>
              マスターDB
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm transition-colors" style={{ color: '#A8B8A8' }}>
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {(expiredCount > 0 || soonCount > 0) && (
          <div className="mb-4 flex gap-2 flex-wrap">
            {expiredCount > 0 && (
              <div className="text-sm font-bold px-4 py-2 rounded-full" style={{ backgroundColor: '#FFE8E8', color: '#B85555' }}>
                ⚠️ 期限切れ {expiredCount}件
              </div>
            )}
            {soonCount > 0 && (
              <div className="text-sm font-bold px-4 py-2 rounded-full" style={{ backgroundColor: '#FFF3DC', color: '#9A7030' }}>
                🕐 期限間近 {soonCount}件
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: '#3F5F4B' }}>
            冷蔵庫の中身
            <span className="ml-2 text-sm font-normal" style={{ color: '#A8B8A8' }}>{allFoods.length}品</span>
          </h2>
          <Link
            href="/add"
            className="text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md hover:opacity-90"
            style={{ backgroundColor: '#4F7A62' }}
          >
            + 追加
          </Link>
        </div>

        <FoodList foods={allFoods as FoodItem[]} />
      </main>
    </div>
  )
}
