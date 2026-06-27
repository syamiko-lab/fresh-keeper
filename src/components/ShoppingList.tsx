'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FoodItem, FoodStatus } from '@/lib/types'
import FoodCard from '@/components/FoodCard'

type Props = { foods: FoodItem[] }

const CATEGORY_ORDER = ['野菜', '肉類', '魚類', '乳製品', '卵・豆腐', '加工食品', 'その他']

const CATEGORY_LABELS: Record<string, string> = {
  '野菜':    '🥬 野菜・果物',
  '肉類':    '🥩 肉類',
  '魚類':    '🐟 魚・海鮮',
  '乳製品':  '🥛 乳製品',
  '卵・豆腐': '🥚 卵・豆腐',
  '加工食品': '🥫 加工食品',
  'その他':  '📦 その他',
}

function groupByCategory(foods: FoodItem[]): [string, FoodItem[]][] {
  const map = new Map<string, FoodItem[]>()
  for (const food of foods) {
    const cat = food.category || 'その他'
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(food)
  }
  const ordered = CATEGORY_ORDER.filter(c => map.has(c)).map(c => [c, map.get(c)!] as [string, FoodItem[]])
  const rest = [...map.entries()].filter(([c]) => !CATEGORY_ORDER.includes(c))
  return [...ordered, ...rest]
}

export default function ShoppingList({ foods }: Props) {
  const router = useRouter()

  async function handleStatusChange(id: string, status: FoodStatus) {
    const supabase = createClient()
    await supabase.from('food_items').update({ status }).eq('id', id)
    router.refresh()
  }

  if (foods.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🛒</div>
        <p className="font-bold" style={{ color: '#A8B8A8' }}>買い物リストは空です</p>
        <p className="text-sm mt-1" style={{ color: '#C0CCC0' }}>冷蔵庫画面でカードをタップして追加できます</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groupByCategory(foods).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-sm font-bold mb-2 px-1" style={{ color: '#8FA898' }}>
            {CATEGORY_LABELS[category] ?? category}
          </h3>
          <div className="space-y-2">
            {items.map(food => (
              <FoodCard key={food.id} food={food} mode="shopping" onStatusChange={handleStatusChange} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
