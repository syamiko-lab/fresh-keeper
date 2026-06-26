'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MasterFood } from '@/lib/types'

type Props = { masterFoods: MasterFood[]; userId: string }

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
    await supabase.from('master_foods').insert({ user_id: userId, name, category, default_days: parseInt(defaultDays) })
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
  const inputStyle: React.CSSProperties = { border: '1.5px solid #C8D8C8', backgroundColor: '#FAFDF8' }

  return (
    <div>
      <h2 className="text-xl font-black mb-6" style={{ color: '#3F5F4B' }}>マスターDB</h2>

      <div className="rounded-[2rem] p-6 mb-6" style={{ backgroundColor: '#FFFEFA', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <h3 className="text-sm font-bold mb-4" style={{ color: '#6B7F73' }}>食材を追加</h3>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="食材名"
              className="flex-1 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors"
              style={inputStyle}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors"
              style={{ ...inputStyle, color: '#3F5F4B' }}
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
              className="flex-1 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors"
              style={inputStyle}
            />
            <span className="text-sm whitespace-nowrap" style={{ color: '#8FA898' }}>日間</span>
            <button
              type="submit"
              disabled={loading}
              className="text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: '#4F7A62' }}
            >
              追加
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {categories.map(cat => (
          <div key={cat} className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFEFA', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="px-4 py-3" style={{ backgroundColor: '#F0F7F2', borderBottom: '1px solid #E0EDE4' }}>
              <p className="text-sm font-bold" style={{ color: '#4F7A62' }}>{cat}</p>
            </div>
            <div>
              {masterFoods.filter(m => m.category === cat).map((m, i, arr) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid #F0F5F0' : 'none' }}
                >
                  <div>
                    <span className="text-sm font-medium" style={{ color: '#3F5F4B' }}>{m.name}</span>
                    <span className="text-xs ml-2" style={{ color: '#A8B8A8' }}>冷蔵 {m.default_days} 日</span>
                    {m.frozen_days && (
                      <span className="text-xs ml-1" style={{ color: '#7788CC' }}>/ 冷凍 {m.frozen_days} 日</span>
                    )}
                    {m.user_id === null && (
                      <span className="text-xs px-2 py-0.5 rounded-full ml-2" style={{ backgroundColor: '#E8F3EC', color: '#4F7A62' }}>共通</span>
                    )}
                  </div>
                  {m.user_id !== null && (
                    <button
                      onClick={() => handleDelete(m.id, m.name)}
                      disabled={deletingId === m.id}
                      className="w-8 h-8 flex items-center justify-center rounded-full transition-all disabled:opacity-30"
                      style={{ color: '#C8D8C8' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FFE8E8', e.currentTarget.style.color = '#B85555')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#C8D8C8')}
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
