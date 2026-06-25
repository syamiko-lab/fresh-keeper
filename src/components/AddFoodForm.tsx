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

  function handleNameChange(value: string) {
    setName(value)

    // マスターDBから一致する食材を探して期限を自動入力
    const matched = masterFoods.find(m =>
      m.name === value || m.name.includes(value) || value.includes(m.name)
    )
    if (matched && value.length >= 2) {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + matched.default_days)
      setExpiryDate(toDateString(expiry))
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

  // カテゴリごとにグルーピング
  const categories = [...new Set(masterFoods.map(m => m.category))]

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← 戻る</Link>
        <h2 className="text-lg font-semibold text-gray-700">食材を追加</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            食材名 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            list="master-foods-list"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="例：豚肉、牛乳、キャベツ"
          />
          <datalist id="master-foods-list">
            {masterFoods.map(m => (
              <option key={m.id} value={m.name} />
            ))}
          </datalist>
          <p className="text-xs text-gray-400 mt-1">マスターDBに登録済みの食材は賞味期限が自動入力されます</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            賞味期限 <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">数量（任意）</label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="例：2パック、300g"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="例：冷凍済み、開封済み"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? '保存中...' : '冷蔵庫に追加'}
        </button>
      </form>

      <div className="mt-6">
        <p className="text-xs text-gray-400 mb-2 font-medium">マスターDB登録済みの食材</p>
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat}>
              <p className="text-xs text-gray-500 mb-1">{cat}</p>
              <div className="flex flex-wrap gap-1">
                {masterFoods.filter(m => m.category === cat).map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleNameChange(m.name)}
                    className="text-xs bg-gray-100 hover:bg-green-100 text-gray-600 px-2 py-1 rounded-full transition-colors"
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
