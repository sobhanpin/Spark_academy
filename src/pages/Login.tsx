import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      setLoading(false)
      setError('ایمیل یا رمز عبور اشتباه است.')
      return
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    setLoading(false)
    if (profile?.role === 'admin') navigate('/admin')
    else if (profile?.role === 'teacher') navigate('/teacher')
    else navigate('/dashboard')
  }

  return (
    <div className="relative max-w-sm mx-auto px-4 py-20">
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 30%, var(--glow-violet), transparent 65%)' }}
      />

      <h1 className="text-2xl sm:text-3xl font-black mb-7 text-center">ورود به حساب</h1>

      <form
        onSubmit={submit}
        className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4"
        style={{ boxShadow: 'var(--shadow-glass), 0 20px 50px -20px rgba(0,0,0,0.5)' }}
      >
        {error && (
          <div className="bg-[#FB7185]/15 text-[#FB7185] text-sm rounded-btn px-3.5 py-2.5 border border-[#FB7185]/20">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs text-[#7B7FB5] mb-1.5">ایمیل</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300"
          />
        </div>

        <div>
          <label className="block text-xs text-[#7B7FB5] mb-1.5">رمز عبور</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300"
          />
        </div>

        <button
          disabled={loading}
          className="btn-primary w-full rounded-btn shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform duration-300 disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0"
        >
          {loading ? 'در حال ورود...' : 'ورود'}
        </button>

        <div className="text-center text-sm pt-1">
          <Link to="/forgot-password" className="text-[#8B8FC0] hover:text-accent transition-colors duration-300">
            رمز عبور را فراموش کرده‌اید؟
          </Link>
        </div>

        <div className="text-center text-sm text-[#7B7FB5] pt-2 border-t border-white/5">
          حساب ندارید؟{' '}
          <Link to="/signup" className="text-accent hover:underline transition-colors duration-300">
            ثبت‌نام کنید
          </Link>
        </div>
      </form>
    </div>
  )
      }
