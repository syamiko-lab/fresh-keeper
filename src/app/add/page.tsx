import { redirect } from 'next/navigation'
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-green-600">🥦 Fresh Keeper</h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <AddFoodForm masterFoods={masterFoods as MasterFood[] ?? []} userId={user.id} />
      </main>
    </div>
  )
}
