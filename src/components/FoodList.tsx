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

function EditModal({ food, onClose, onSaved }: {
  food: FoodItem
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(food.name)
  const [expiryDate, setExpiryDate] = useState(food.expiry_date)
  const [quantity, setQuantity] = useState(food.quantity ?? '')
  const [memo, setMemo] = useState(food.memo ?? '')
  const [storageType, setStorageType] = useState<'冷蔵' | '冷凍'>(food.storage_type ?? '冷蔵')
  const [loading, setLoading] = useState(false)

  const inputStyle: React.CSSProperties = { border: '1.5px solid #C8D8C8', backgroundColor: '#FAFDF8' }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.from('food_items').update({
      name,
      expiry_date: expiryDate,
      quantity: quantity || null,
      memo: memo || null,
      storage_type: storageType,
    }).eq('id', food.id)
    setLoading(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-[2rem] p-6 space-y-4" style={{ backgroundColor: '#FFFEFA', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black" style={{ color: '#3F5F4B' }}>食材を編集</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-lg" style={{ color: '#A8B8A8' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7F73' }}>食材名</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7F73' }}>保存方法</label>
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1.5px solid #C8D8C8' }}>
              <button type="button" onClick={() => setStorageType('冷蔵')} className="flex-1 py-2.5 text-sm font-bold transition-all"
                style={storageType === '冷蔵' ? { backgroundColor: '#4F7A62', color: '#FFFFFF' } : { backgroundColor: '#FAFDF8', color: '#8FA898' }}>
                🧊 冷蔵
              </button>
              <button type="button" onClick={() => setStorageType('冷凍')} className="flex-1 py-2.5 text-sm font-bold transition-all"
                style={storageType === '冷凍' ? { backgroundColor: '#4466BB', color: '#FFFFFF' } : { backgroundColor: '#FAFDF8', color: '#8FA898' }}>
                ❄️ 冷凍
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7F73' }}>賞味期限</label>
            <input
              type="date"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7F73' }}>数量（任意）</label>
              <input type="text" value={quantity} onChange={e => setQuantity(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none" style={inputStyle} placeholder="例：2パック" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7F73' }}>メモ（任意）</label>
              <input type="text" value={memo} onChange={e => setMemo(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none" style={inputStyle} placeholder="メモ" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full text-white font-black py-3.5 rounded-xl transition-all shadow-sm hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#4F7A62' }}>
            {loading ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function FoodList({ foods }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`「${name}」を削除しますか？`)) return
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('food_items').delete().eq('id', id)
    router.refresh()
    setDeletingId(null)
  }

  async function handleMoveToShopping(id: string) {
    const supabase = createClient()
    await supabase.from('food_items').update({ status: 'shopping' }).eq('id', id)
    router.refresh()
  }

  function handleSaved() {
    setEditingFood(null)
    router.refresh()
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
    <>
      {editingFood && (
        <EditModal food={editingFood} onClose={() => setEditingFood(null)} onSaved={handleSaved} />
      )}
      <div className="space-y-6">
        {expired.length > 0 && <Section title="⚠️ 期限切れ"        foods={expired} onDelete={handleDelete} onEdit={setEditingFood} onShopping={handleMoveToShopping} deletingId={deletingId} />}
        {soon.length > 0    && <Section title="🕐 期限間近（3日以内）" foods={soon}    onDelete={handleDelete} onEdit={setEditingFood} onShopping={handleMoveToShopping} deletingId={deletingId} />}
        {fresh.length > 0   && <Section title="✅ まだ大丈夫"        foods={fresh}   onDelete={handleDelete} onEdit={setEditingFood} onShopping={handleMoveToShopping} deletingId={deletingId} />}
      </div>
    </>
  )
}

function Section({ title, foods, onDelete, onEdit, onShopping, deletingId }: {
  title: string
  foods: FoodItem[]
  onDelete: (id: string, name: string) => void
  onEdit: (food: FoodItem) => void
  onShopping: (id: string) => void
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
              <div className="flex items-center gap-1 ml-3">
                <button
                  onClick={() => onShopping(food.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-all text-base"
                  style={{ color: '#C8D8C8' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FFF3DC', e.currentTarget.style.color = '#9A7030')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#C8D8C8')}
                  aria-label="買い物リストへ"
                >
                  🛒
                </button>
                <button
                  onClick={() => onEdit(food)}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-all text-base"
                  style={{ color: '#C8D8C8' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#E8F3EC', e.currentTarget.style.color = '#4F7A62')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#C8D8C8')}
                  aria-label="編集"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(food.id, food.name)}
                  disabled={deletingId === food.id}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-all disabled:opacity-30"
                  style={{ color: '#C8D8C8' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FFE8E8', e.currentTarget.style.color = '#B85555')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#C8D8C8')}
                  aria-label="削除"
                >
                  🗑
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
