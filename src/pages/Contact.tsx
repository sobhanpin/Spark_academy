import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Contact() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('contact_messages').insert({ name, phone, message })
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-black mb-6 text-center">تماس با ما</h1>
      {sent ? (
        <div className="card text-center text-sm text-[#8B8FC0]">پیامت ارسال شد. به‌زودی باهات تماس می‌گیریم.</div>
      ) : (
        <form onSubmit={submit} className="card space-y-3">
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="نام و نام خانوادگی" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="شماره تماس" />
          <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="input resize-none" placeholder="پیام شما" />
          <button disabled={loading} className="btn-primary w-full">{loading ? 'در حال ارسال...' : 'ارسال پیام'}</button>
        </form>
      )}
    </div>
  )
}
