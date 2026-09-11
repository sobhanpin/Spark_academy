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
      <div className="relative max-w-sm mx-auto px-4 py-20 text-center">
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 30%, var(--glow-gold), transparent 65%)' }}
        />
        <div
          className="glass-panel rounded-3xl p-8"
          style={{ boxShadow: 'var(--shadow-glass), 0 20px 50px -20px rgba(0,0,0,0.5)' }}
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-white/5 shadow-neumo-out grid place-items-center text-3xl mb-4">📩</div>
          <h1 className="text-xl font-black mb-2">ثبت‌نام تقریباً تمام شد</h1>
          <p className="text-sm text-[#8B8FC0] leading-relaxed">یک ایمیل تأیید برایت ارسال شد. برای فعال‌سازی حساب، روی لینک داخل ایمیل بزن.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative max-w-sm mx-auto px-4 py-20">
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 30%, var(--glow-gold), transparent 65%)' }}
      />

      <h1 className="text-2xl sm:text-3xl font-black mb-7 text-center">ساخت حساب دانشجویی</h1>

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
          <label className="block text-xs text-[#7B7FB5] mb-1.5">نام و نام خانوادگی</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300"
          />
        </div>

        <div>
          <label className="block text-xs text-[#7B7FB5] mb-1.5">شماره تماس</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300"
            placeholder="09xxxxxxxxx"
          />
        </div>

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
          <label className="block text-xs text-[#7B7FB5] mb-1.5">رمز عبور (حداقل ۶ کاراکتر)</label>
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
          {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
        </button>

        <div className="text-center text-sm text-[#7B7FB5] pt-2 border-t border-white/5">
          حساب دارید؟{' '}
          <Link to="/login" className="text-accent hover:underline transition-colors duration-300">
            وارد شوید
          </Link>
        </div>
      </form>
    </div>
  )
          }
