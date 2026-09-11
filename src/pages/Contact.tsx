import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Contact() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.from('contact_messages').insert({ name, phone, message })
    setLoading(false)
    if (error) { setError('خطا در ارسال پیام. دوباره تلاش کن.'); return }
    setSent(true)
  }

  return (
    <div className="relative max-w-sm mx-auto px-4 py-20">
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 30%, var(--glow-violet), transparent 65%)' }}
      />

      <h1 className="text-2xl sm:text-3xl font-black mb-7 text-center">تماس با ما</h1>

      {sent ? (
        <div
          className="glass-panel rounded-3xl p-7 text-center"
          style={{ boxShadow: 'var(--shadow-glass), 0 20px 50px -20px rgba(0,0,0,0.5)' }}
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-white/5 shadow-neumo-out grid place-items-center text-3xl mb-4">✅</div>
          <p className="text-sm text-[#8B8FC0] leading-relaxed">پیامت ارسال شد. به‌زودی باهات تماس می‌گیریم.</p>
        </div>
      ) : (
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
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300"
            placeholder="نام و نام خانوادگی"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300"
            placeholder="شماره تماس"
          />
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300 resize-none"
            placeholder="پیام شما"
          />
          <button
            disabled={loading}
            className="btn-primary w-full rounded-btn shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform duration-300 disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0"
          >
            {loading ? 'در حال ارسال...' : 'ارسال پیام'}
          </button>
        </form>
      )}
    </div>
  )
            }
