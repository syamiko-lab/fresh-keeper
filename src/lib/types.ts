export type FoodStatus = 'active' | 'shopping' | 'completed'

export type FoodItem = {
  id: string
  user_id: string
  name: string
  expiry_date: string
  quantity: string | null
  memo: string | null
  storage_type: '冷蔵' | '冷凍'
  status: FoodStatus
  created_at: string
}

export type MasterFood = {
  id: string
  user_id: string | null
  name: string
  category: string
  default_days: number
  frozen_days: number | null
  created_at: string
}
