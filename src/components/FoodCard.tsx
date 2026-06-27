'use client'

import { useState } from 'react'
import { FoodItem, FoodStatus } from '@/lib/types'

export type FoodMode = 'fridge' | 'shopping'

type Props = {
  food: FoodItem
  mode: FoodMode
  onStatusChange: (id: string, status: FoodStatus) => void
  onEdit?: (food: FoodItem) => void
}

function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function ExpiryBadge({ days }: { days: number }) {
  if (days < 0)   return <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FFE8E8', color: '#B85555' }}>期限切れ</span>
  if (days === 0) return <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FFE8E8', color: '#B85555' }}>今日まで</span>
  if (days <= 3)  return <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FFF3DC', color: '#9A7030' }}>あと{days}日</span>
  return <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#E8F3EC', color: '#4F7A62' }}>あと{days}日</span>
}

function getCardStyle(mode: FoodMode, days: number): React.CSSProperties {
  if (mode === 'shopping') return { backgroundColor: '#FFFEFA', borderLeft: '4px solid #C8D8C8' }
  if (days < 0)   return { backgroundColor: '#FFF8F8', borderLeft: '4px solid #E8A0A0' }
  if (days <= 3)  return { backgroundColor: '#FFFCF4', borderLeft: '4px solid #E8C870' }
  return { backgroundColor: '#FFFEFA', borderLeft: '4px solid #90BFA0' }
}

export default function FoodCard({ food, mode, onStatusChange, onEdit }: Props) {
  const [expanded, setExpanded] = useState(false)
  const days = getDaysUntilExpiry(food.expiry_date)

  function handleAction(status: FoodStatus) {
    onStatusChange(food.id, status)
    setExpanded(false)
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ ...getCardStyle(mode, days), boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      {/* メイン行：タップで展開 */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold truncate" style={{ color: '#3F5F4B' }}>{food.name}</p>
            {food.storage_type === '冷凍' && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#E8F0FF', color: '#4466BB' }}>❄️ 冷凍</span>
            )}
          </div>
          {mode === 'fridge' && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs" style={{ color: '#A8B8A8' }}>{food.expiry_date}</span>
              {food.quantity && <span className="text-xs" style={{ color: '#A8B8A8' }}>・{food.quantity}</span>}
              <ExpiryBadge days={days} />
            </div>
          )}
          {mode === 'shopping' && food.quantity && (
            <p className="text-xs mt-0.5" style={{ color: '#A8B8A8' }}>{food.quantity}</p>
          )}
          {food.memo && <p className="text-xs mt-1 truncate" style={{ color: '#B8C8B8' }}>{food.memo}</p>}
        </div>
        <span className="ml-3 flex-shrink-0 text-xs" style={{ color: '#C8D8C8' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* 展開アクション */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 flex gap-2 flex-wrap" style={{ borderTop: '1px solid #F0F5F0' }}>
          {mode === 'fridge' && (
            <>
              <button
                onClick={() => handleAction('shopping')}
                className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ backgroundColor: '#FFF3DC', color: '#9A7030' }}
              >
                🛒 買い物リストへ
              </button>
              <button
                onClick={() => handleAction('completed')}
                className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ backgroundColor: '#E8F3EC', color: '#4F7A62' }}
              >
                ✓ 消費済み
              </button>
              {onEdit && (
                <button
                  onClick={() => { onEdit(food); setExpanded(false) }}
                  className="text-xs font-medium px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: '#F0F5F0', color: '#6B7F73' }}
                >
                  ✏️ 編集
                </button>
              )}
            </>
          )}
          {mode === 'shopping' && (
            <>
              <button
                onClick={() => handleAction('active')}
                className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ backgroundColor: '#F0F5F0', color: '#8FA898' }}
              >
                ↩ 戻す
              </button>
              <button
                onClick={() => handleAction('completed')}
                className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                style={{ backgroundColor: '#4F7A62' }}
              >
                ✓ 購入済み
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
