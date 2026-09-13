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
    <div className="auth-wrap">
      <div className="auth-glow" aria-hidden="true" />
      <div className="auth-particle" style={{ top: '8%', right: '10%', width: '2.5rem', height: '2.5rem', animationDelay: '0s' }} aria-hidden="true" />
      <div className="auth-particle auth-particle-gold" style={{ bottom: '20%', left: '6%', width: '1.75rem', height: '1.75rem', animationDelay: '2s' }} aria-hidden="true" />
      <div className="auth-particle" style={{ top: '45%', left: '2%', width: '1.25rem', height: '1.25rem', animationDelay: '3.5s' }} aria-hidden="true" />

      <h1 className="auth-title">ورود به حساب</h1>

      <form onSubmit={submit} className="auth-card space-y-4">
        {error && <div className="auth-error">{error}</div>}

        <div>
          <label className="auth-label">ایمیل</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-3d" />
        </div>

        <div>
          <label className="auth-label">رمز عبور</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-3d" />
        </div>

        <button disabled={loading} className="hero-primary-btn w-full justify-center disabled:opacity-60 disabled:pointer-events-none">
          {loading ? 'در حال ورود...' : 'ورود'}
        </button>

        <div className="text-center text-sm">
          <Link to="/forgot-password" className="auth-link">رمز عبور را فراموش کرده‌اید؟</Link>
        </div>

        <div className="auth-divider text-sm text-[#9290B8]">
          حساب ندارید؟{' '}
          <Link to="/signup" className="text-accent hover:underline font-bold">ثبت‌نام کنید</Link>
        </div>
      </form>
    </div>
  )
                                             }
