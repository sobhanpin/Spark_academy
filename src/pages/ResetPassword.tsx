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
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) setError('لینک منقضی شده. دوباره درخواست بازیابی رمز بده.')
    else navigate('/dashboard')
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-black mb-6 text-center">تنظیم رمز عبور جدید</h1>
      <form onSubmit={submit} className="card space-y-3">
        {error && <div className="bg-[#FB7185]/15 text-[#FB7185] text-sm rounded-lg px-3 py-2">{error}</div>}
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="رمز عبور جدید" />
        <button disabled={loading} className="btn-primary w-full">{loading ? 'در حال ذخیره...' : 'ذخیره رمز جدید'}</button>
      </form>
    </div>
  )
}
