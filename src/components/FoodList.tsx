'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FoodItem } from '@/lib/types'

type Props = { foods: FoodItem[] }

function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function ExpiryBadge({ days }: { days: number }) {
  if (days < 0) return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600">期限切れ</span>
  if (days === 0) return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600">今日まで</span>
  if (days <= 3) return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-600">あと{days}日</span>
  return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-600">あと{days}日</span>
}

function cardStyle(days: number): string {
  if (days < 0) return 'border-l-4 border-l-red-400 bg-red-50/50'
  if (days <= 3) return 'border-l-4 border-l-amber-400 bg-amber-50/50'
  return 'border-l-4 border-l-emerald-400 bg-white'
}

export default function FoodList({ foods }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`「${name}」を削除しますか？`)) return
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('food_items').delete().eq('id', id)
    router.refresh()
    setDeletingId(null)
  }

  if (foods.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🥬</div>
        <p className="font-bold text-gray-400">食材が登録されていません</p>
        <p className="text-sm text-gray-300 mt-1">「追加」ボタンから登録してください</p>
      </div>
    )
  }

  const expired = foods.filter(f => getDaysUntilExpiry(f.expiry_date) < 0)
  const soon = foods.filter(f => { const d = getDaysUntilExpiry(f.expiry_date); return d >= 0 && d <= 3 })
  const fresh = foods.filter(f => getDaysUntilExpiry(f.expiry_date) > 3)

  return (
    <div className="space-y-6">
      {expired.length > 0 && <Section title="⚠️ 期限切れ" foods={expired} onDelete={handleDelete} deletingId={deletingId} />}
      {soon.length > 0 && <Section title="🕐 期限間近（3日以内）" foods={soon} onDelete={handleDelete} deletingId={deletingId} />}
      {fresh.length > 0 && <Section title="✅ まだ大丈夫" foods={fresh} onDelete={handleDelete} deletingId={deletingId} />}
    </div>
  )
}

function Section({ title, foods, onDelete, deletingId }: {
  title: string
  foods: FoodItem[]
  onDelete: (id: string, name: string) => void
  deletingId: string | null
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-500 mb-2 px-1">{title}</h3>
      <div className="space-y-2">
        {foods.map(food => {
          const days = getDaysUntilExpiry(food.expiry_date)
          return (
            <div key={food.id} className={`rounded-2xl p-4 shadow-sm flex items-center justify-between ${cardStyle(days)}`}>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">{food.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-gray-400">{food.expiry_date}</span>
                  {food.quantity && <span className="text-xs text-gray-400">・{food.quantity}</span>}
                  <ExpiryBadge days={days} />
                </div>
                {food.memo && <p className="text-xs text-gray-400 mt-1 truncate">{food.memo}</p>}
              </div>
              <button
                onClick={() => onDelete(food.id, food.name)}
                disabled={deletingId === food.id}
                className="ml-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-100 hover:text-red-500 transition-all disabled:opacity-30"
                aria-label="削除"
              >
                🗑
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
