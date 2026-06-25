'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('メールアドレスまたはパスワードが正しくありません')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/login-bg.png')" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-4">
            <h1 className="text-3xl font-black" style={{ color: '#3F5F4B' }}>Fresh Keeper</h1>
            <p className="text-sm font-bold mt-1" style={{ color: '#6B7F73' }}>冷蔵庫の食材を賢く管理しよう</p>
          </div>
        </div>

        <div className="rounded-[2rem] p-8" style={{ backgroundColor: '#FFFEFA', boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 6px rgba(0,0,0,0.04)' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: '#3F5F4B' }}>ログイン</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#6B7F73' }}>メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                style={{ border: '1.5px solid #C8D8C8', backgroundColor: '#FAFDF8' }}
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#6B7F73' }}>パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                style={{ border: '1.5px solid #C8D8C8', backgroundColor: '#FAFDF8' }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#FFF0F0', border: '1px solid #F5C6C6' }}>
                <p className="text-sm" style={{ color: '#B85555' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-3 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: '#4F7A62' }}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#8FA898' }}>
            アカウントをお持ちでない方は{' '}
            <Link href="/signup" className="font-bold hover:underline" style={{ color: '#4F7A62' }}>
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
