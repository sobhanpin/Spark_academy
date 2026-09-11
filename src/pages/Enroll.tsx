import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase, Course } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Spinner from '../components/Spinner'

export default function Enroll() {
  const { id } = useParams()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [classMode, setClassMode] = useState<'in_person' | 'online'>('in_person')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [docFile, setDocFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (id) supabase.from('courses').select('*').eq('id', id).single().then(({ data }) => setCourse(data))
  }, [id])

  const submit = async () => {
    if (!session) { navigate('/login'); return }
    setLoading(true)

    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: session.user.id,
        course_id: id,
        class_mode: classMode,
        payment_status: 'pending',
      })
      .select()
      .single()

    if (!error && docFile && enrollment) {
      const path = `${session.user.id}/${Date.now()}_${docFile.name}`
      const { error: upErr } = await supabase.storage.from('uploads').upload(path, docFile)
      if (!upErr) {
        await supabase.from('uploads').insert({
          user_id: session.user.id,
          course_id: id,
          file_name: docFile.name,
          file_path: path,
          file_type: docFile.type,
          size_kb: Math.round(docFile.size / 1024),
        })
      }
    }

    setLoading(false)
    setDone(true)
  }

  if (!course) return <Spinner />

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
          <div className="w-14 h-14 mx-auto rounded-full bg-white/5 shadow-neumo-out grid place-items-center text-3xl mb-4">✅</div>
          <h1 className="text-xl font-black mb-2">ثبت‌نام اولیه انجام شد</h1>
          <p className="text-sm text-[#8B8FC0] mb-6 leading-relaxed">
            برای نهایی‌شدن ثبت‌نام، شهریه‌ی <b className="text-accent">{course.price.toLocaleString('fa-IR')} تومان</b> رو حضوری در آموزشگاه پرداخت کن. بعد از پرداخت، وضعیتت در پنل به «پرداخت‌شده» تغییر می‌کنه.
          </p>
          <Link
            to="/dashboard"
            className="btn-primary rounded-btn shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform duration-300"
          >
            رفتن به پنل من
          </Link>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <p className="text-[#8B8FC0] mb-4">برای ثبت‌نام در دوره، اول باید وارد حساب بشی.</p>
        <Link
          to="/login"
          className="btn-primary rounded-btn shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform duration-300"
        >
          ورود / ثبت‌نام
        </Link>
      </div>
    )
  }

  return (
    <div className="relative max-w-sm mx-auto px-4 py-20">
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 30%, var(--glow-violet), transparent 65%)' }}
      />

      <h1 className="text-xl sm:text-2xl font-black mb-1">ثبت‌نام در دوره</h1>
      <p className="text-[#8B8FC0] mb-6">{course.title}</p>

      {course.required_documents && (
        <div className="bg-accent/10 border border-accent/30 rounded-btn p-3.5 text-sm text-accent mb-5 shadow-neumo-out">
          📄 مدارک موردنیاز: {course.required_documents}
        </div>
      )}

      <div
        className="glass-panel rounded-3xl p-6 space-y-5"
        style={{ boxShadow: 'var(--shadow-glass), 0 20px 50px -20px rgba(0,0,0,0.5)' }}
      >
        <div>
          <label className="block text-xs text-[#7B7FB5] mb-2">نوع کلاس</label>
          <div className="grid grid-cols-2 gap-2">
            {(['in_person', 'online'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setClassMode(m)}
                disabled={course.mode !== 'both' && course.mode !== m}
                className={`py-2.5 rounded-btn text-sm font-medium border transition-all duration-300 disabled:opacity-30 ${
                  classMode === m
                    ? 'bg-gradient-to-l from-accent to-accent2 text-bg border-accent shadow-glow-gold'
                    : 'bg-bg border-white/10 text-[#A8ACD9] shadow-neumo-out hover:-translate-y-0.5'
                }`}
              >
                {m === 'in_person' ? 'حضوری' : 'آنلاین'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#7B7FB5] mb-2">آپلود مدرک</label>
          <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-white/15 rounded-btn py-4 text-sm text-[#A8ACD9] text-center shadow-neumo-in hover:border-accent/40 transition-colors duration-300"
          >
            {docFile ? `📎 ${docFile.name}` : '📎 آپلود مدرک'}
          </button>
          <p className="text-xs text-[#5C5F8A] mt-1.5">آپلود اینجا اختیاریه — می‌تونی مدرک رو حضوری هم در آموزشگاه تحویل بدی.</p>
        </div>

        <div className="bg-violet/10 border border-violet/30 rounded-btn p-3.5 text-sm text-[#D8D7FF] shadow-neumo-out">
          💳 پرداخت شهریه به‌صورت <b>حضوری در آموزشگاه</b> (نقدی یا کارت‌خوان) انجام می‌شود. بعد از ثبت‌نام، وضعیتت «در انتظار پرداخت» می‌شود.
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-[#7B7FB5]">شهریه</span>
          <span className="font-bold text-accent">{course.price.toLocaleString('fa-IR')} تومان</span>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="btn-primary w-full rounded-btn shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform duration-300 disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0"
        >
          {loading ? 'در حال ثبت...' : 'تأیید و ثبت‌نام'}
        </button>
      </div>
    </div>
  )
        }
