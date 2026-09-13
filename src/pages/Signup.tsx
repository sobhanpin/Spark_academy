import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('رمز عبور باید حداقل ۶ کاراکتر باشد.'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone }, emailRedirectTo: 'https://sobhanpin.github.io/Spark_academy/' },
    })
    setLoading(false)
    if (error) { setError(error.message.includes('already') ? 'این ایمیل قبلاً ثبت شده است.' : 'خطا در ثبت‌نام. دوباره تلاش کنید.'); return }

    if (data.session) navigate('/dashboard')
    else setDone(true)
  }

  if (done) {
    return (
      <div className="auth-wrap text-center">
        <div className="auth-glow" aria-hidden="true" />
        <div className="auth-particle" style={{ top: '8%', right: '10%', width: '2.5rem', height: '2.5rem' }} aria-hidden="true" />
        <div className="auth-particle auth-particle-gold" style={{ bottom: '20%', left: '6%', width: '1.75rem', height: '1.75rem', animationDelay: '2s' }} aria-hidden="true" />
        <div className="auth-card">
          <div className="text-4xl mb-3">📩</div>
          <h1 className="auth-title !mb-2">ثبت‌نام تقریباً تمام شد</h1>
          <p className="text-sm text-[#9290B8] leading-7">یک ایمیل تأیید برایت ارسال شد. برای فعال‌سازی حساب، روی لینک داخل ایمیل بزن.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-wrap">
      <div className="auth-glow" aria-hidden="true" />
      <div className="auth-particle" style={{ top: '6%', right: '8%', width: '2.5rem', height: '2.5rem', animationDelay: '0s' }} aria-hidden="true" />
      <div className="auth-particle auth-particle-gold" style={{ bottom: '15%', left: '4%', width: '1.75rem', height: '1.75rem', animationDelay: '2s' }} aria-hidden="true" />
      <div className="auth-particle" style={{ top: '50%', left: '1%', width: '1.25rem', height: '1.25rem', animationDelay: '3.5s' }} aria-hidden="true" />

      <h1 className="auth-title">ساخت حساب دانشجویی</h1>

      <form onSubmit={submit} className="auth-card space-y-4">
        {error && <div className="auth-error">{error}</div>}

        <div>
          <label className="auth-label">نام و نام خانوادگی</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input-3d" />
        </div>

        <div>
          <label className="auth-label">شماره تماس</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-3d" placeholder="09xxxxxxxxx" />
        </div>

        <div>
          <label className="auth-label">ایمیل</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-3d" />
        </div>

        <div>
          <label className="auth-label">رمز عبور (حداقل ۶ کاراکتر)</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-3d" />
        </div>

        <button disabled={loading} className="hero-primary-btn w-full justify-center disabled:opacity-60 disabled:pointer-events-none">
          {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
        </button>

        <div className="auth-divider text-sm text-[#9290B8]">
          حساب دارید؟{' '}
          <Link to="/login" className="text-accent hover:underline font-bold">وارد شوید</Link>
        </div>
      </form>
    </div>
  )
      }
