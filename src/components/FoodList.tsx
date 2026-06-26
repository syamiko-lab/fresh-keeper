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

function cardStyle(days: number): React.CSSProperties {
  if (days < 0)  return { backgroundColor: '#FFF8F8', borderLeft: '4px solid #E8A0A0' }
  if (days <= 3) return { backgroundColor: '#FFFCF4', borderLeft: '4px solid #E8C870' }
  return { backgroundColor: '#FFFEFA', borderLeft: '4px solid #90BFA0' }
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
        <p className="font-bold" style={{ color: '#A8B8A8' }}>食材が登録されていません</p>
        <p className="text-sm mt-1" style={{ color: '#C0CCC0' }}>「追加」ボタンから登録してください</p>
      </div>
    )
  }

  const expired = foods.filter(f => getDaysUntilExpiry(f.expiry_date) < 0)
  const soon    = foods.filter(f => { const d = getDaysUntilExpiry(f.expiry_date); return d >= 0 && d <= 3 })
  const fresh   = foods.filter(f => getDaysUntilExpiry(f.expiry_date) > 3)

  return (
    <div className="space-y-6">
      {expired.length > 0 && <Section title="⚠️ 期限切れ"        foods={expired} onDelete={handleDelete} deletingId={deletingId} />}
      {soon.length > 0    && <Section title="🕐 期限間近（3日以内）" foods={soon}    onDelete={handleDelete} deletingId={deletingId} />}
      {fresh.length > 0   && <Section title="✅ まだ大丈夫"        foods={fresh}   onDelete={handleDelete} deletingId={deletingId} />}
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
      <h3 className="text-sm font-bold mb-2 px-1" style={{ color: '#8FA898' }}>{title}</h3>
      <div className="space-y-2">
        {foods.map(food => {
          const days = getDaysUntilExpiry(food.expiry_date)
          return (
            <div key={food.id} className="rounded-2xl p-4 flex items-center justify-between" style={{ ...cardStyle(days), boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
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
              <button
                onClick={() => onDelete(food.id, food.name)}
                disabled={deletingId === food.id}
                className="ml-4 w-8 h-8 flex items-center justify-center rounded-full transition-all disabled:opacity-30"
                style={{ color: '#C8D8C8' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FFE8E8', e.currentTarget.style.color = '#B85555')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#C8D8C8')}
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
