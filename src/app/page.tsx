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

  const expiredCount = (foods ?? []).filter(f => {
    const days = Math.floor((new Date(f.expiry_date).getTime() - new Date().setHours(0,0,0,0)) / 86400000)
    return days < 0
  }).length

  const soonCount = (foods ?? []).filter(f => {
    const days = Math.floor((new Date(f.expiry_date).getTime() - new Date().setHours(0,0,0,0)) / 86400000)
    return days >= 0 && days <= 3
  }).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <header className="bg-white/80 backdrop-blur border-b border-emerald-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥦</span>
            <h1 className="text-xl font-black text-emerald-600">Fresh Keeper</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/master" className="text-sm text-gray-500 hover:text-emerald-600 font-medium transition-colors">
              マスターDB
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
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
              <div className="bg-red-100 text-red-700 text-sm font-bold px-4 py-2 rounded-full">
                ⚠️ 期限切れ {expiredCount}件
              </div>
            )}
            {soonCount > 0 && (
              <div className="bg-amber-100 text-amber-700 text-sm font-bold px-4 py-2 rounded-full">
                🕐 期限間近 {soonCount}件
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-700">
            冷蔵庫の中身
            <span className="ml-2 text-sm font-normal text-gray-400">{(foods ?? []).length}品</span>
          </h2>
          <Link
            href="/add"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg"
          >
            + 追加
          </Link>
        </div>

        <FoodList foods={foods as FoodItem[] ?? []} />
      </main>
    </div>
  )
}
