import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase, Course } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Enroll() {
  const { id } = useParams()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [classMode, setClassMode] = useState<'in_person' | 'online'>('in_person')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) supabase.from('courses').select('*').eq('id', id).single().then(({ data }) => setCourse(data))
  }, [id])

  const submit = async () => {
    if (!session) { navigate('/login'); return }
    setLoading(true)
    await supabase.from('enrollments').insert({
      user_id: session.user.id,
      course_id: id,
      class_mode: classMode,
      payment_status: 'pending',
    })
    setLoading(false)
    setDone(true)
  }

  if (!course) return <div className="text-center py-24 text-[#8B8FC0]">در حال بارگذاری...</div>

  if (done) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h1 className="text-xl font-black mb-2">ثبت‌نام اولیه انجام شد</h1>
        <p className="text-sm text-[#8B8FC0] mb-6">
          برای نهایی‌شدن ثبت‌نام، شهریه‌ی <b className="text-accent">{course.price.toLocaleString('fa-IR')} تومان</b> رو حضوری در آموزشگاه پرداخت کن. بعد از پرداخت، وضعیتت در پنل به «پرداخت‌شده» تغییر می‌کنه.
        </p>
        <Link to="/dashboard" className="btn-primary">رفتن به پنل من</Link>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <p className="text-[#8B8FC0] mb-4">برای ثبت‌نام در دوره، اول باید وارد حساب بشی.</p>
        <Link to="/login" className="btn-primary">ورود / ثبت‌نام</Link>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-xl font-black mb-1">ثبت‌نام در دوره</h1>
      <p className="text-[#8B8FC0] mb-6">{course.title}</p>

      <div className="card space-y-4">
        <div>
          <label className="block text-xs text-[#7B7FB5] mb-2">نوع کلاس</label>
          <div className="grid grid-cols-2 gap-2">
            {(['in_person', 'online'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setClassMode(m)}
                disabled={course.mode !== 'both' && course.mode !== m}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-30 ${
                  classMode === m ? 'bg-accent text-bg border-accent' : 'bg-bg border-white/10 text-[#A8ACD9]'
                }`}
              >
                {m === 'in_person' ? 'حضوری' : 'آنلاین'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-violet/10 border border-violet/30 rounded-xl p-3 text-sm text-[#D8D7FF]">
          💳 پرداخت شهریه به‌صورت <b>حضوری در آموزشگاه</b> (نقدی یا کارت‌خوان) انجام می‌شود. بعد از ثبت‌نام، وضعیتت «در انتظار پرداخت» می‌شود.
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-[#7B7FB5]">شهریه</span>
          <span className="font-bold text-accent">{course.price.toLocaleString('fa-IR')} تومان</span>
        </div>

        <button onClick={submit} disabled={loading} className="btn-primary w-full">
          {loading ? 'در حال ثبت...' : 'تأیید و ثبت‌نام'}
        </button>
      </div>
    </div>
  )
                                                    }
