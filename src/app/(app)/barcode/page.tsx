import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MasterFood } from '@/lib/types'
import BarcodeRegister from '@/components/BarcodeRegister'

export default async function BarcodePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: masterFoods } = await supabase
    .from('master_foods')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order('name', { ascending: true })

  return (
    <div className="max-w-lg mx-auto">
      <BarcodeRegister userId={user.id} masterFoods={masterFoods as MasterFood[] ?? []} />
    </div>
  )
}
