'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MasterFood } from '@/lib/types'

type Props = { masterFoods: MasterFood[]; userId: string }

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

export default function AddFoodForm({ masterFoods, userId }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [quantity, setQuantity] = useState('')
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [autoFilled, setAutoFilled] = useState(false)

  function handleNameChange(value: string) {
    setName(value)
    const matched = masterFoods.find(m =>
      m.name === value || m.name.includes(value) || value.includes(m.name)
    )
    if (matched && value.length >= 2) {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + matched.default_days)
      setExpiryDate(toDateString(expiry))
      setAutoFilled(true)
    } else {
      setAutoFilled(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.from('food_items').insert({
      user_id: userId,
      name,
      expiry_date: expiryDate,
      quantity: quantity || null,
      memo: memo || null,
    })
    if (error) {
      setError('保存に失敗しました。もう一度お試しください。')
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  const categories = [...new Set(masterFoods.map(m => m.category))]

  const inputStyle: React.CSSProperties = { border: '1.5px solid #C8D8C8', backgroundColor: '#FAFDF8' }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full transition-colors" style={{ backgroundColor: '#FFFEFA', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', color: '#6B7F73' }}>
          ←
        </Link>
        <h2 className="text-xl font-black" style={{ color: '#3F5F4B' }}>食材を追加</h2>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[2rem] p-6 space-y-5 mb-6" style={{ backgroundColor: '#FFFEFA', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7F73' }}>
            食材名 <span style={{ color: '#B85555' }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            list="master-foods-list"
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
            style={inputStyle}
            placeholder="例：豚肉、牛乳、キャベツ"
          />
          <datalist id="master-foods-list">
            {masterFoods.map(m => <option key={m.id} value={m.name} />)}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7F73' }}>
            賞味期限 <span style={{ color: '#B85555' }}>*</span>
            {autoFilled && (
              <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E8F3EC', color: '#4F7A62' }}>
                自動入力
              </span>
            )}
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => { setExpiryDate(e.target.value); setAutoFilled(false) }}
            required
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
            style={inputStyle}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7F73' }}>数量（任意）</label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
              style={inputStyle}
              placeholder="例：2パック"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7F73' }}>メモ（任意）</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
              style={inputStyle}
              placeholder="例：冷凍済み"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#FFF0F0', border: '1px solid #F5C6C6' }}>
            <p className="text-sm" style={{ color: '#B85555' }}>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-black py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: '#4F7A62' }}
        >
          {loading ? '保存中...' : '🧊 冷蔵庫に追加'}
        </button>
      </form>

      <div className="rounded-[2rem] p-6" style={{ backgroundColor: '#FFFEFA', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <p className="text-sm font-bold mb-4" style={{ color: '#8FA898' }}>タップして選択</p>
        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat}>
              <p className="text-xs font-bold mb-2" style={{ color: '#A8B8A8' }}>{cat}</p>
              <div className="flex flex-wrap gap-2">
                {masterFoods.filter(m => m.category === cat).map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleNameChange(m.name)}
                    className="text-sm px-3 py-1.5 rounded-full transition-all font-medium"
                    style={name === m.name
                      ? { backgroundColor: '#4F7A62', color: '#FFFFFF' }
                      : { backgroundColor: '#E8F3EC', color: '#4F7A62' }
                    }
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
