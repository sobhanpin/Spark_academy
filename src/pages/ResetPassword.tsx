import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('رمز عبور باید حداقل ۶ کاراکتر باشد.'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.updateUser({ password })
    if (error || !data.user) {
      setLoading(false)
      setError('لینک منقضی شده. دوباره درخواست بازیابی رمز بده.')
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

      <h1 className="text-2xl sm:text-3xl font-black mb-7 text-center">تنظیم رمز عبور جدید</h1>

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
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300"
          placeholder="رمز عبور جدید"
        />
        <button
          disabled={loading}
          className="btn-primary w-full rounded-btn shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform duration-300 disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0"
        >
          {loading ? 'در حال ذخیره...' : 'ذخیره رمز جدید'}
        </button>
      </form>
    </div>
  )
                  }
