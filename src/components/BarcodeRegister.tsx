'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MasterFood } from '@/lib/types'
import BarcodeScanner from '@/components/BarcodeScanner'

type Props = { userId: string; masterFoods: MasterFood[] }

type Step = 'scan' | 'confirm'

type FormState = {
  name: string
  category: string
  storageType: '冷蔵' | '冷凍'
  expiryDate: string
}

const CATEGORIES = ['野菜', '肉類', '魚類', '乳製品', '卵・豆腐', '加工食品', 'その他']

function toDateString(date: Date) {
  return date.toISOString().split('T')[0]
}

export default function BarcodeRegister({ userId, masterFoods }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('scan')
  const [barcode, setBarcode] = useState('')
  const [form, setForm] = useState<FormState>({ name: '', category: 'その他', storageType: '冷蔵', expiryDate: '' })
  const [loading, setLoading] = useState(false)

  function handleDetected(code: string) {
    setBarcode(code)
    const matched = masterFoods.find(m => m.name === code)
    if (matched) {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + matched.default_days)
      setForm({ name: matched.name, category: matched.category, storageType: '冷蔵', expiryDate: toDateString(expiry) })
    } else {
      setForm({ name: '', category: 'その他', storageType: '冷蔵', expiryDate: '' })
    }
    setStep('confirm')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.from('food_items').insert({
      user_id: userId,
      name: form.name,
      barcode,
      category: form.category,
      expiry_date: form.expiryDate,
      storage_type: form.storageType,
      status: 'active',
      quantity: null,
      memo: null,
    })
    router.push('/')
    router.refresh()
  }

  const inputStyle: React.CSSProperties = { border: '1.5px solid #C8D8C8', backgroundColor: '#FAFDF8' }

  if (step === 'scan') {
    return (
      <div>
        <h2 className="text-xl font-black mb-2" style={{ color: '#3F5F4B' }}>バーコードで追加</h2>
        <p className="text-sm mb-6" style={{ color: '#8FA898' }}>バーコードをスキャンして食材を登録します</p>
        <div className="rounded-[2rem] p-6" style={{ backgroundColor: '#FFFEFA', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <BarcodeScanner onDetected={handleDetected} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-black mb-6" style={{ color: '#3F5F4B' }}>スキャン結果を確認</h2>
      <form onSubmit={handleSave} className="space-y-5">
        <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#E8F3EC', border: '1px solid #C8E0CC' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#6B7F73' }}>読み取りコード</p>
          <p className="font-mono font-bold tracking-wider" style={{ color: '#3F5F4B' }}>{barcode}</p>
        </div>

        <div className="rounded-[2rem] p-6 space-y-5" style={{ backgroundColor: '#FFFEFA', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7F73' }}>
              商品名 <span style={{ color: '#B85555' }}>*</span>
            </label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none" style={inputStyle} placeholder="商品名を入力" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7F73' }}>カテゴリ</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none" style={{ ...inputStyle, color: '#3F5F4B' }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7F73' }}>保存方法</label>
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1.5px solid #C8D8C8' }}>
              <button type="button" onClick={() => setForm({ ...form, storageType: '冷蔵' })} className="flex-1 py-2.5 text-sm font-bold transition-all"
                style={form.storageType === '冷蔵' ? { backgroundColor: '#4F7A62', color: '#FFF' } : { backgroundColor: '#FAFDF8', color: '#8FA898' }}>
                🧊 冷蔵
              </button>
              <button type="button" onClick={() => setForm({ ...form, storageType: '冷凍' })} className="flex-1 py-2.5 text-sm font-bold transition-all"
                style={form.storageType === '冷凍' ? { backgroundColor: '#4466BB', color: '#FFF' } : { backgroundColor: '#FAFDF8', color: '#8FA898' }}>
                ❄️ 冷凍
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7F73' }}>
              賞味期限 <span style={{ color: '#B85555' }}>*</span>
            </label>
            <input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} required
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none" style={inputStyle} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => setStep('scan')} className="py-3.5 rounded-xl text-sm font-bold transition-all px-5"
            style={{ backgroundColor: '#F0F5F0', color: '#6B7F73' }}>
            ↩ 再スキャン
          </button>
          <button type="submit" disabled={loading} className="flex-1 py-3.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: '#4F7A62' }}>
            {loading ? '保存中...' : '🧊 登録する'}
          </button>
        </div>
      </form>
    </div>
  )
}
