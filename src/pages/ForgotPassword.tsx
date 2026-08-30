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
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-black mb-6 text-center">بازیابی رمز عبور</h1>
      {sent ? (
        <div className="card text-center text-sm text-[#8B8FC0]">
          اگر این ایمیل تو سیستم ثبت باشد، یک لینک بازیابی رمز برایش ارسال شد. صندوق ورودی (و پوشه اسپم) را چک کن.
        </div>
      ) : (
        <form onSubmit={submit} className="card space-y-3">
          <p className="text-sm text-[#8B8FC0]">ایمیلی که باهاش ثبت‌نام کردی رو وارد کن تا لینک بازیابی رمز برات ارسال بشه.</p>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="ایمیل" />
          <button disabled={loading} className="btn-primary w-full">{loading ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}</button>
        </form>
      )}
    </div>
  )
}
