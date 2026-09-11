import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="relative max-w-sm mx-auto px-4 py-20">
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 30%, var(--glow-violet), transparent 65%)' }}
      />

      <h1 className="text-2xl sm:text-3xl font-black mb-7 text-center">بازیابی رمز عبور</h1>

      {sent ? (
        <div
          className="glass-panel rounded-3xl p-7 text-center"
          style={{ boxShadow: 'var(--shadow-glass), 0 20px 50px -20px rgba(0,0,0,0.5)' }}
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-white/5 shadow-neumo-out grid place-items-center text-3xl mb-4">✉️</div>
          <p className="text-sm text-[#8B8FC0] leading-relaxed">
            اگر این ایمیل تو سیستم ثبت باشد، یک لینک بازیابی رمز برایش ارسال شد. صندوق ورودی (و پوشه اسپم) را چک کن.
          </p>
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4"
          style={{ boxShadow: 'var(--shadow-glass), 0 20px 50px -20px rgba(0,0,0,0.5)' }}
        >
          <p className="text-sm text-[#8B8FC0] leading-relaxed">
            ایمیلی که باهاش ثبت‌نام کردی رو وارد کن تا لینک بازیابی رمز برات ارسال بشه.
          </p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300"
            placeholder="ایمیل"
          />
          <button
            disabled={loading}
            className="btn-primary w-full rounded-btn shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform duration-300 disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0"
          >
            {loading ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}
          </button>
        </form>
      )}
    </div>
  )
            }
