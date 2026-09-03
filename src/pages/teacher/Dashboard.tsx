import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Course, Enrollment } from '../../lib/supabase'

type ChatMsg = {
  id: string
  enrollment_id: string
  sender_id: string
  message: string
  created_at: string
}

const TABS = ['دوره‌های من', 'دانشجویان و چت', 'گفتگو با مدیریت'] as const

export default function TeacherDashboard() {
  const { session, profile } = useAuth()
  const [tab, setTab] = useState<(typeof TABS)[number]>('دوره‌های من')
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [activeEnrollment, setActiveEnrollment] = useState<Enrollment | null>(null)

  useEffect(() => {
    if (!session) return
    supabase.from('courses').select('*').eq('teacher_id', session.user.id).then(({ data }) => setCourses(data || []))
    supabase
      .from('enrollments')
      .select('*, courses(*), profiles(*)')
      .then(({ data }) => {
        const mine = (data as Enrollment[] || []).filter((e) => e.courses?.teacher_id === session.user.id)
        setEnrollments(mine)
      })
  }, [session])

  if (activeEnrollment) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => setActiveEnrollment(null)} className="text-sm text-accent mb-4">← برگشت</button>
        <ChatBox enrollmentId={activeEnrollment.id} title={`${activeEnrollment.profiles?.name} · ${activeEnrollment.courses?.title}`} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-black mb-4">پنل مدرس — سلام {profile?.name} 👋</h1>

      <div className="grid grid-cols-3 gap-1 bg-bgsoft p-1 rounded-xl border border-white/5 mb-5 text-xs">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`py-2.5 rounded-lg font-medium transition-colors ${tab === t ? 'bg-accent text-bg' : 'text-[#A8ACD9]'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'دوره‌های من' && (
        <div className="space-y-2">
          {courses.map((c) => (
            <div key={c.id} className="card !py-3">
              <div className="font-bold text-sm">{c.title}</div>
              <div className="text-xs text-[#7B7FB5] mt-1">{c.mode === 'both' ? 'حضوری و آنلاین' : c.mode === 'in_person' ? 'حضوری' : 'آنلاین'} · {c.category}</div>
            </div>
          ))}
          {courses.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز دوره‌ای به تو اختصاص داده نشده.</div>}
        </div>
      )}

      {tab === 'دانشجویان و چت' && (
        <div className="space-y-2">
          {enrollments.map((e) => (
            <button key={e.id} onClick={() => setActiveEnrollment(e)} className="card !py-3 w-full text-right flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">{e.profiles?.name}</div>
                <div className="text-xs text-[#7B7FB5]">{e.courses?.title} · {e.class_mode === 'in_person' ? 'حضوری' : 'آنلاین'}</div>
              </div>
              <span className="text-accent text-xs">گفتگو ←</span>
            </button>
          ))}
          {enrollments.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز دانشجویی ثبت‌نام نکرده.</div>}
        </div>
      )}

      {tab === 'گفتگو با مدیریت' && (
        <div className="card text-center text-sm text-[#8B8FC0] py-10">
          برای هماهنگی با مدیریت، از طریق شماره تماس آموزشگاه (در پایین سایت) اقدام کن.
        </div>
      )}
    </div>
  )
}

function ChatBox({ enrollmentId, title }: { enrollmentId: string; title: string }) {
  const { session } = useAuth()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [text, setText] = useState('')

  const load = () => {
    supabase.from('chat_messages').select('*').eq('enrollment_id', enrollmentId).order('created_at').then(({ data }) => setMessages(data || []))
  }
  useEffect(() => { load() }, [enrollmentId])

  const send = async () => {
    if (!text.trim() || !session) return
    await supabase.from('chat_messages').insert({ enrollment_id: enrollmentId, sender_id: session.user.id, message: text.trim() })
    setText('')
    load()
  }

  return (
    <div className="card">
      <div className="font-bold text-sm mb-3">{title}</div>
      <div className="space-y-2 max-h-80 overflow-y-auto mb-3">
        {messages.map((m) => (
          <div key={m.id} className={`text-sm px-3 py-2 rounded-xl max-w-[80%] ${m.sender_id === session?.user.id ? 'bg-accent text-bg mr-auto' : 'bg-white/5 text-[#C4C7ED]'}`}>
            {m.message}
          </div>
        ))}
        {messages.length === 0 && <div className="text-center text-[#5C5F8A] text-sm py-6">هنوز پیامی نیست.</div>}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="input flex-1" placeholder="پیام..." onKeyDown={(e) => e.key === 'Enter' && send()} />
        <button onClick={send} className="btn-primary !px-4">ارسال</button>
      </div>
    </div>
  )
          }
