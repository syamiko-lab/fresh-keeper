'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MasterFood } from '@/lib/types'

type Props = {
  masterFoods: MasterFood[]
  userId: string
}

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

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-400 hover:text-emerald-600 transition-colors">
          ←
        </Link>
        <h2 className="text-xl font-black text-gray-700">食材を追加</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm p-6 space-y-5 mb-6">
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1.5">
            食材名 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            list="master-foods-list"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
            placeholder="例：豚肉、牛乳、キャベツ"
          />
          <datalist id="master-foods-list">
            {masterFoods.map(m => <option key={m.id} value={m.name} />)}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1.5">
            賞味期限 <span className="text-red-400">*</span>
            {autoFilled && (
              <span className="ml-2 text-xs font-normal text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                自動入力
              </span>
            )}
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => { setExpiryDate(e.target.value); setAutoFilled(false) }}
            required
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">数量（任意）</label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
              placeholder="例：2パック"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">メモ（任意）</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
              placeholder="例：冷凍済み"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-base"
        >
          {loading ? '保存中...' : '🧊 冷蔵庫に追加'}
        </button>
      </form>

      <div className="bg-white rounded-3xl shadow-sm p-6">
        <p className="text-sm font-bold text-gray-500 mb-4">タップして選択</p>
        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat}>
              <p className="text-xs font-bold text-gray-400 mb-2">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {masterFoods.filter(m => m.category === cat).map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleNameChange(m.name)}
                    className={`text-sm px-3 py-1.5 rounded-full transition-all font-medium ${
                      name === m.name
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
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
