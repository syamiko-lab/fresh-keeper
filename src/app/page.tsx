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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-600">🥦 Fresh Keeper</h1>
          <div className="flex items-center gap-3">
            <Link href="/master" className="text-sm text-gray-500 hover:text-gray-700">
              マスターDB
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">冷蔵庫の中身</h2>
          <Link
            href="/add"
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + 食材を追加
          </Link>
        </div>

        <FoodList foods={foods as FoodItem[] ?? []} />
      </main>
    </div>
  )
}

function LogoutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">
        ログアウト
      </button>
    </form>
  )
}
