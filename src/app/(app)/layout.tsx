import Link from 'next/link'
import { Nunito } from 'next/font/google'
import { createClient } from '@/lib/supabase/server'

const nunito = Nunito({ weight: '800', subsets: ['latin'] })

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const username = user?.email?.split('@')[0] ?? ''

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F7F2' }}>
      <header className="sticky top-0 z-10" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div className="relative flex items-center justify-between px-6" style={{ height: '100px' }}>
          <img
            src="/header-bg.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'left center' }}
          />
          <div className="relative z-10">
            <h1 className={`${nunito.className} text-3xl tracking-wide`} style={{ color: '#3F5F4B', textShadow: '0 1px 6px rgba(255,255,255,0.7)' }}>
              Fresh Keeper
            </h1>
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <span className="text-sm font-medium hidden sm:block" style={{ color: '#3F5F4B', textShadow: '0 1px 4px rgba(255,255,255,0.7)' }}>
              👤 {username}
            </span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm font-medium px-4 py-1.5 rounded-full transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.75)', color: '#3F5F4B', backdropFilter: 'blur(4px)' }}
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>

        {/* PCのみ表示するタブ */}
        <nav className="hidden md:flex" style={{ backgroundColor: '#FFFEFA', borderTop: '1px solid #E8F0E8' }}>
          <div className="max-w-2xl mx-auto w-full flex">
            <NavTab href="/" label="🧊 冷蔵庫" />
            <NavTab href="/add" label="＋ 食材追加" />
            <NavTab href="/master" label="📋 マスターDB" />
          </div>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* スマホのみ表示するボトムナビ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 flex" style={{ backgroundColor: '#FFFEFA', borderTop: '1px solid #E8F0E8', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}>
        <BottomTab href="/" icon="🧊" label="冷蔵庫" />
        <BottomTab href="/add" icon="＋" label="追加" />
        <BottomTab href="/master" icon="📋" label="マスターDB" />
      </nav>
    </div>
  )
}

function NavTab({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="px-6 py-3 text-sm font-medium transition-colors hover:opacity-70" style={{ color: '#4F7A62' }}>
      {label}
    </Link>
  )
}

function BottomTab({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="flex-1 flex flex-col items-center justify-center py-3 transition-colors hover:opacity-70" style={{ color: '#4F7A62' }}>
      <span className="text-xl">{icon}</span>
      <span className="text-xs mt-0.5 font-medium">{label}</span>
    </Link>
  )
}
