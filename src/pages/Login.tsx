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
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-black mb-6 text-center">ورود به حساب</h1>
      <form onSubmit={submit} className="card space-y-3">
        {error && <div className="bg-[#FB7185]/15 text-[#FB7185] text-sm rounded-lg px-3 py-2">{error}</div>}
        <div>
          <label className="block text-xs text-[#7B7FB5] mb-1">ایمیل</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-xs text-[#7B7FB5] mb-1">رمز عبور</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? 'در حال ورود...' : 'ورود'}</button>
        <div className="text-center text-sm">
          <Link to="/forgot-password" className="text-[#8B8FC0] hover:text-accent">رمز عبور را فراموش کرده‌اید؟</Link>
        </div>
        <div className="text-center text-sm text-[#7B7FB5]">
          حساب ندارید؟ <Link to="/signup" className="text-accent hover:underline">ثبت‌نام کنید</Link>
        </div>
      </form>
    </div>
  )
}
