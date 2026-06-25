import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MasterFoodManager from '@/components/MasterFoodManager'
import { MasterFood } from '@/lib/types'

export default async function MasterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: masterFoods } = await supabase
    .from('master_foods')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  return <MasterFoodManager masterFoods={masterFoods as MasterFood[] ?? []} userId={user.id} />
}
