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

  async function handleDelete(id: string, name: string) {
    if (!confirm(`「${name}」を削除しますか？`)) return
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('master_foods').delete().eq('id', id)
    router.refresh()
    setDeletingId(null)
  }

  const categories = [...new Set(masterFoods.map(m => m.category))]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-400 hover:text-emerald-600 transition-colors">
          ←
        </Link>
        <h2 className="text-xl font-black text-gray-700">マスターDB</h2>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-600 mb-4">食材を追加</h3>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="食材名"
              className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors bg-white"
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
              placeholder="日数"
              className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">日間</span>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 whitespace-nowrap"
            >
              追加
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {categories.map(cat => (
          <div key={cat} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
              <p className="text-sm font-bold text-emerald-700">{cat}</p>
            </div>
            <div className="divide-y divide-gray-100">
              {masterFoods.filter(m => m.category === cat).map(m => (
                <div key={m.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{m.name}</span>
                    <span className="text-xs text-gray-400 ml-2">購入後 {m.default_days} 日</span>
                    {m.user_id === null && (
                      <span className="text-xs text-teal-500 bg-teal-50 px-2 py-0.5 rounded-full ml-2">共通</span>
                    )}
                  </div>
                  {m.user_id !== null && (
                    <button
                      onClick={() => handleDelete(m.id, m.name)}
                      disabled={deletingId === m.id}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-100 hover:text-red-500 transition-all disabled:opacity-30"
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
