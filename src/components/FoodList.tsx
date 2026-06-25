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
  if (days < 0) {
    return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">期限切れ</span>
  }
  if (days === 0) {
    return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">今日まで</span>
  }
  if (days <= 3) {
    return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">あと{days}日</span>
  }
  return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">あと{days}日</span>
}

function borderColor(days: number): string {
  if (days < 0) return 'border-l-4 border-l-red-400'
  if (days <= 3) return 'border-l-4 border-l-yellow-400'
  return 'border-l-4 border-l-green-400'
}

export default function FoodList({ foods }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('food_items').delete().eq('id', id)
    router.refresh()
    setDeletingId(null)
  }

  if (foods.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-3">🥬</div>
        <p className="text-sm">食材が登録されていません</p>
        <p className="text-xs mt-1">「食材を追加」から登録してください</p>
      </div>
    )
  }

  const expired = foods.filter(f => getDaysUntilExpiry(f.expiry_date) < 0)
  const soon = foods.filter(f => {
    const d = getDaysUntilExpiry(f.expiry_date)
    return d >= 0 && d <= 3
  })
  const fresh = foods.filter(f => getDaysUntilExpiry(f.expiry_date) > 3)

  return (
    <div className="space-y-6">
      {expired.length > 0 && (
        <Section title="⚠️ 期限切れ" foods={expired} onDelete={handleDelete} deletingId={deletingId} />
      )}
      {soon.length > 0 && (
        <Section title="🕐 期限間近（3日以内）" foods={soon} onDelete={handleDelete} deletingId={deletingId} />
      )}
      {fresh.length > 0 && (
        <Section title="✅ まだ大丈夫" foods={fresh} onDelete={handleDelete} deletingId={deletingId} />
      )}
    </div>
  )
}

function Section({ title, foods, onDelete, deletingId }: {
  title: string
  foods: FoodItem[]
  onDelete: (id: string) => void
  deletingId: string | null
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <div className="space-y-2">
        {foods.map(food => {
          const days = getDaysUntilExpiry(food.expiry_date)
          return (
            <div key={food.id} className={`bg-white rounded-xl p-4 shadow-sm flex items-center justify-between ${borderColor(days)}`}>
              <div>
                <p className="font-medium text-gray-800">{food.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">{food.expiry_date}</span>
                  {food.quantity && <span className="text-xs text-gray-400">・{food.quantity}</span>}
                  <ExpiryBadge days={days} />
                </div>
                {food.memo && <p className="text-xs text-gray-400 mt-1">{food.memo}</p>}
              </div>
              <button
                onClick={() => onDelete(food.id)}
                disabled={deletingId === food.id}
                className="text-gray-300 hover:text-red-400 transition-colors ml-4 text-lg disabled:opacity-30"
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
