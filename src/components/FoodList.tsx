'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FoodItem, FoodStatus } from '@/lib/types'
import FoodCard from '@/components/FoodCard'

type Props = { foods: FoodItem[]; userId: string }

function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
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
    }).eq('id', food.id).eq('user_id', food.user_id)
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
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none" style={inputStyle} />
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
            <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} required
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none" style={inputStyle} />
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

export default function FoodList({ foods, userId }: Props) {
  const router = useRouter()
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null)

  async function handleStatusChange(id: string, status: FoodStatus) {
    const supabase = createClient()
    await supabase.from('food_items').update({ status }).eq('id', id).eq('user_id', userId)
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

  const now = new Date().setHours(0, 0, 0, 0)
  const expired = foods.filter(f => new Date(f.expiry_date).setHours(0,0,0,0) <= now && getDaysUntilExpiry(f.expiry_date) < 0)
  const soon    = foods.filter(f => { const d = getDaysUntilExpiry(f.expiry_date); return d >= 0 && d <= 3 })
  const fresh   = foods.filter(f => getDaysUntilExpiry(f.expiry_date) > 3)

  return (
    <>
      {editingFood && (
        <EditModal food={editingFood} onClose={() => setEditingFood(null)} onSaved={handleSaved} />
      )}
      <div className="space-y-6">
        {expired.length > 0 && (
          <Section title="⚠️ 期限切れ" foods={expired} onStatusChange={handleStatusChange} onEdit={setEditingFood} />
        )}
        {soon.length > 0 && (
          <Section title="🕐 期限間近（3日以内）" foods={soon} onStatusChange={handleStatusChange} onEdit={setEditingFood} />
        )}
        {fresh.length > 0 && (
          <Section title="✅ まだ大丈夫" foods={fresh} onStatusChange={handleStatusChange} onEdit={setEditingFood} />
        )}
      </div>
    </>
  )
}

function Section({ title, foods, onStatusChange, onEdit }: {
  title: string
  foods: FoodItem[]
  onStatusChange: (id: string, status: FoodStatus) => void
  onEdit: (food: FoodItem) => void
}) {
  return (
    <div>
      <h3 className="text-sm font-bold mb-2 px-1" style={{ color: '#8FA898' }}>{title}</h3>
      <div className="space-y-2">
        {foods.map(food => (
          <FoodCard
            key={food.id}
            food={food}
            mode="fridge"
            onStatusChange={onStatusChange}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  )
}
