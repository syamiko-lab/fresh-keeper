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

const CATEGORIES = ['肉類', '魚類', '野菜', '乳製品', '卵・豆腐', '加工食品', 'その他']

export default function MasterFoodManager({ masterFoods, userId }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('野菜')
  const [defaultDays, setDefaultDays] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    await supabase.from('master_foods').insert({
      user_id: userId,
      name,
      category,
      default_days: parseInt(defaultDays),
    })

    setName('')
    setDefaultDays('')
    router.refresh()
    setLoading(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('master_foods').delete().eq('id', id)
    router.refresh()
    setDeletingId(null)
  }

  const categories = [...new Set(masterFoods.map(m => m.category))]

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← 戻る</Link>
        <h2 className="text-lg font-semibold text-gray-700">マスターDB</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">食材を追加</h3>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="食材名"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={defaultDays}
              onChange={(e) => setDefaultDays(e.target.value)}
              required
              min={1}
              placeholder="デフォルト日数"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">日間</span>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              追加
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-600">{cat}</p>
            </div>
            <div className="divide-y divide-gray-100">
              {masterFoods.filter(m => m.category === cat).map(m => (
                <div key={m.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="text-sm text-gray-800">{m.name}</span>
                    <span className="text-xs text-gray-400 ml-2">購入後 {m.default_days} 日</span>
                    {m.user_id === null && (
                      <span className="text-xs text-blue-400 ml-2">共通</span>
                    )}
                  </div>
                  {m.user_id !== null && (
                    <button
                      onClick={() => handleDelete(m.id)}
                      disabled={deletingId === m.id}
                      className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30"
                      aria-label="削除"
                    >
                      🗑
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
