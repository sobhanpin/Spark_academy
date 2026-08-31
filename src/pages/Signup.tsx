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
      options: { data: { name }, emailRedirectTo: 'https://sobhanpin.github.io/Spark_academy/' },
    })
    setLoading(false)
    if (error) { setError(error.message.includes('already') ? 'این ایمیل قبلاً ثبت شده است.' : 'خطا در ثبت‌نام. دوباره تلاش کنید.'); return }

    if (data.user && phone) {
      await supabase.from('profiles').update({ phone }).eq('id', data.user.id)
    }

    if (data.session) navigate('/dashboard')
    else setDone(true)
  }

  if (done) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3">📩</div>
        <h1 className="text-xl font-black mb-2">ثبت‌نام تقریباً تمام شد</h1>
        <p className="text-sm text-[#8B8FC0]">یک ایمیل تأیید برایت ارسال شد. برای فعال‌سازی حساب، روی لینک داخل ایمیل بزن.</p>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-black mb-6 text-center">ساخت حساب دانشجویی</h1>
      <form onSubmit={submit} className="card space-y-3">
        {error && <div className="bg-[#FB7185]/15 text-[#FB7185] text-sm rounded-lg px-3 py-2">{error}</div>}
        <div>
          <label className="block text-xs text-[#7B7FB5] mb-1">نام و نام خانوادگی</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-xs text-[#7B7FB5] mb-1">شماره تماس</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="09xxxxxxxxx" />
        </div>
        <div>
          <label className="block text-xs text-[#7B7FB5] mb-1">ایمیل</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-xs text-[#7B7FB5] mb-1">رمز عبور (حداقل ۶ کاراکتر)</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}</button>
        <div className="text-center text-sm text-[#7B7FB5]">
          حساب دارید؟ <Link to="/login" className="text-accent hover:underline">وارد شوید</Link>
        </div>
      </form>
    </div>
  )
        }
