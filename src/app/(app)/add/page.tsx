import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AddFoodForm from '@/components/AddFoodForm'
import { MasterFood } from '@/lib/types'

export default async function AddPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: masterFoods } = await supabase
    .from('master_foods')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  return (
    <div>
      <Link
        href="/barcode"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold mb-6 transition-all hover:opacity-90"
        style={{ backgroundColor: '#3F5F4B', color: '#FFFEFA' }}
      >
        📷 バーコードで追加
      </Link>
      <AddFoodForm masterFoods={masterFoods as MasterFood[] ?? []} userId={user.id} />
    </div>
  )
}
