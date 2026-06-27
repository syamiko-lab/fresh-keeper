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
  if (days < 0)  return <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FFE8E8', color: '#B85555' }}>期限切れ</span>
  if (days === 0) return <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FFE8E8', color: '#B85555' }}>今日まで</span>
  if (days <= 3)  return <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FFF3DC', color: '#9A7030' }}>あと{days}日</span>
  return <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#E8F3EC', color: '#4F7A62' }}>あと{days}日</span>
}

export default function ShoppingList({ foods }: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleComplete(id: string) {
    setLoadingId(id)
    const supabase = createClient()
    await supabase.from('food_items').update({ status: 'completed' }).eq('id', id)
    router.refresh()
    setLoadingId(null)
  }

  async function handleReturn(id: string) {
    setLoadingId(id)
    const supabase = createClient()
    await supabase.from('food_items').update({ status: 'active' }).eq('id', id)
    router.refresh()
    setLoadingId(null)
  }

  if (foods.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🛒</div>
        <p className="font-bold" style={{ color: '#A8B8A8' }}>買い物リストは空です</p>
        <p className="text-sm mt-1" style={{ color: '#C0CCC0' }}>冷蔵庫画面の 🛒 ボタンで追加できます</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {foods.map(food => {
        const days = getDaysUntilExpiry(food.expiry_date)
        return (
          <div key={food.id} className="rounded-2xl p-4 flex items-center justify-between" style={{ backgroundColor: '#FFFEFA', borderLeft: '4px solid #C8D8C8', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold truncate" style={{ color: '#3F5F4B' }}>{food.name}</p>
                {food.storage_type === '冷凍' && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#E8F0FF', color: '#4466BB' }}>❄️ 冷凍</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs" style={{ color: '#A8B8A8' }}>{food.expiry_date}</span>
                {food.quantity && <span className="text-xs" style={{ color: '#A8B8A8' }}>・{food.quantity}</span>}
                <ExpiryBadge days={days} />
              </div>
              {food.memo && <p className="text-xs mt-1 truncate" style={{ color: '#B8C8B8' }}>{food.memo}</p>}
            </div>
            <div className="flex items-center gap-1 ml-3">
              <button
                onClick={() => handleReturn(food.id)}
                disabled={loadingId === food.id}
                className="text-xs font-medium px-3 py-1.5 rounded-full transition-all disabled:opacity-30"
                style={{ backgroundColor: '#F0F5F0', color: '#8FA898' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#E0EDE4')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#F0F5F0')}
              >
                戻す
              </button>
              <button
                onClick={() => handleComplete(food.id)}
                disabled={loadingId === food.id}
                className="text-xs font-bold px-3 py-1.5 rounded-full transition-all disabled:opacity-30 text-white"
                style={{ backgroundColor: '#4F7A62' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                ✓ 購入済み
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
