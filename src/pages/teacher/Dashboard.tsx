import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Course, Enrollment, CourseMaterial } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'

type ChatMsg = { id: string; enrollment_id: string; sender_id: string; message: string; created_at: string }

const TABS = ['دوره‌های من', 'دانشجویان و چت', 'جزوات', 'گفتگو با مدیریت'] as const

const inputCls = 'input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300'
const btnCls = 'btn-primary rounded-btn shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform duration-300 disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0'

export default function TeacherDashboard() {
  const { session, profile } = useAuth()
  const [tab, setTab] = useState<(typeof TABS)[number]>('دوره‌های من')
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [activeEnrollment, setActiveEnrollment] = useState<Enrollment | null>(null)

  const loadCourses = () => {
    if (!session) return
    supabase.from('courses').select('*').eq('teacher_id', session.user.id).then(({ data }) => setCourses(data || []))
  }

  useEffect(() => {
    if (!session) return
    loadCourses()
    supabase.from('enrollments').select('*, courses(*), profiles(*)').then(({ data }) => {
      const mine = (data as Enrollment[] || []).filter((e) => e.courses?.teacher_id === session.user.id)
      setEnrollments(mine)
    })
  }, [session])

  if (activeEnrollment) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => setActiveEnrollment(null)} className="text-sm text-accent mb-4 hover:-translate-x-0.5 transition-transform duration-300 inline-block">← برگشت</button>
        <ChatBox enrollmentId={activeEnrollment.id} title={`${activeEnrollment.profiles?.name} · ${activeEnrollment.courses?.title}`} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-xl sm:text-2xl font-black mb-5">پنل مدرس — سلام {profile?.name} 👋</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 glass-panel p-1.5 rounded-2xl mb-6 text-xs">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-2.5 rounded-btn font-medium transition-all duration-300 ${
              tab === t ? 'bg-gradient-to-l from-accent to-accent2 text-bg font-bold shadow-glow-gold' : 'text-[#A8ACD9] hover:bg-white/5'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'دوره‌های من' && (
        <div className="space-y-2.5">
          {courses.map((c) => (
            <TeacherCourseCard key={c.id} course={c} onSaved={loadCourses} />
          ))}
          {courses.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز دوره‌ای به تو اختصاص داده نشده.</div>}
        </div>
      )}

      {tab === 'دانشجویان و چت' && (
        <div className="space-y-2.5">
          {enrollments.map((e) => (
            <button key={e.id} onClick={() => setActiveEnrollment(e)} className="glass-panel rounded-btn p-4 w-full text-right flex items-center justify-between transition-transform duration-300 hover:-translate-y-0.5">
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

      {tab === 'جزوات' && <TeacherMaterials courses={courses} />}

      {tab === 'گفتگو با مدیریت' && (
        <div className="glass-panel rounded-card text-center text-sm text-[#8B8FC0] py-10">برای هماهنگی با مدیریت، از طریق شماره تماس آموزشگاه (پایین سایت) اقدام کن.</div>
      )}
    </div>
  )
}

function TeacherCourseCard({ course, onSaved }: { course: Course; onSaved: () => void }) {
  const { showToast } = useToast()
  const [editingLink, setEditingLink] = useState(false)
  const [link, setLink] = useState(course.online_link || '')
  const [busy, setBusy] = useState(false)

  const canHaveOnlineLink = course.mode !== 'in_person'

  const save = async () => {
    setBusy(true)
    const { error } = await supabase.rpc('update_course_online_link', { course_id: course.id, new_link: link.trim() || null })
    setBusy(false)
    if (error) { showToast('خطا در ذخیره لینک: ' + error.message, 'error'); return }
    setEditingLink(false)
    onSaved()
    showToast('لینک کلاس ذخیره شد.')
  }

  return (
    <div className="glass-panel rounded-card p-4">
      <div className="font-bold text-sm">{course.title}</div>
      <div className="text-xs text-[#7B7FB5] mt-1">{course.mode === 'both' ? 'حضوری و آنلاین' : course.mode === 'in_person' ? 'حضوری' : 'آنلاین'} · {course.category}</div>

      {canHaveOnlineLink && (
        <div className="mt-2.5">
          {editingLink ? (
            <div className="flex gap-2 items-center">
              <input
                className={`${inputCls} !py-1.5 text-xs flex-1`}
                placeholder="لینک کلاس آنلاین (اسکای‌روم/گوگل‌میت و غیره)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
              <button onClick={save} disabled={busy} className="text-xs bg-accent text-bg font-bold px-3 py-1.5 rounded-btn shrink-0 shadow-glow-gold hover:-translate-y-0.5 transition-transform duration-300 disabled:opacity-60">{busy ? '...' : 'ذخیره'}</button>
              <button onClick={() => { setEditingLink(false); setLink(course.online_link || '') }} className="text-xs text-[#7B7FB5] shrink-0 hover:text-accent transition-colors duration-300">انصراف</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {course.online_link ? (
                <a href={course.online_link} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline transition-colors duration-300">🔗 لینک کلاس</a>
              ) : (
                <span className="text-xs text-[#5C5F8A]">لینک کلاس ثبت نشده</span>
              )}
              <button onClick={() => setEditingLink(true)} className="text-xs text-[#A8ACD9] underline hover:text-accent transition-colors duration-300">ویرایش لینک</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TeacherMaterials({ courses }: { courses: Course[] }) {
  const { session } = useAuth()
  const { showToast } = useToast()
  const [items, setItems] = useState<CourseMaterial[]>([])
  const [courseId, setCourseId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)

  const load = () => {
    if (!session) return
    supabase.from('course_materials').select('*, courses(*)').eq('teacher_id', session.user.id).order('uploaded_at', { ascending: false }).then(({ data }) => setItems((data as CourseMaterial[]) || []))
  }
  useEffect(() => { load() }, [session])

  const upload = async () => {
    if (!courseId || !file || !session) { showToast('دوره و فایل رو انتخاب کن', 'error'); return }
    setBusy(true)
    const path = `${courseId}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('materials').upload(path, file)
    if (!error) {
      await supabase.from('course_materials').insert({ course_id: courseId, teacher_id: session.user.id, file_name: file.name, file_path: path })
      setFile(null); load()
      showToast('جزوه آپلود شد.')
    } else {
      showToast('خطا در آپلود: ' + error.message, 'error')
    }
    setBusy(false)
  }

  const remove = async (m: CourseMaterial) => {
    await supabase.storage.from('materials').remove([m.file_path])
    await supabase.from('course_materials').delete().eq('id', m.id)
    load()
  }

  const openFile = async (path: string) => {
    const { data } = await supabase.storage.from('materials').createSignedUrl(path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  return (
    <div className="space-y-3">
      <div className="glass-panel rounded-card p-5 space-y-2">
        <select className={inputCls} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">انتخاب دوره</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className={inputCls} />
        <button onClick={upload} disabled={busy} className={`${btnCls} w-full`}>{busy ? 'در حال آپلود...' : 'آپلود جزوه'}</button>
      </div>
      {items.map((m) => (
        <div key={m.id} className="glass-panel rounded-btn p-4 flex items-center justify-between">
          <button onClick={() => openFile(m.file_path)} className="text-right flex-1 truncate hover:text-accent transition-colors duration-300">
            <div className="text-sm font-medium truncate">{m.file_name}</div>
            <div className="text-xs text-[#7B7FB5]">{m.courses?.title}</div>
          </button>
          <button onClick={() => remove(m)} className="text-[#FB7185] text-xs px-2 hover:underline transition-colors duration-300">حذف</button>
        </div>
      ))}
      {items.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز جزوه‌ای آپلود نکردی.</div>}
    </div>
  )
}

function ChatBox({ enrollmentId, title }: { enrollmentId: string; title: string }) {
  const { session } = useAuth()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [text, setText] = useState('')
  const load = () => { supabase.from('chat_messages').select('*').eq('enrollment_id', enrollmentId).order('created_at').then(({ data }) => setMessages(data || [])) }
  useEffect(() => { load() }, [enrollmentId])
  const send = async () => {
    if (!text.trim() || !session) return
    await supabase.from('chat_messages').insert({ enrollment_id: enrollmentId, sender_id: session.user.id, message: text.trim() })
    setText(''); load()
  }
  return (
    <div className="glass-panel rounded-card p-5">
      <div className="font-bold text-sm mb-3">{title}</div>
      <div className="space-y-2 max-h-80 overflow-y-auto mb-3">
        {messages.map((m) => (
          <div key={m.id} className={`text-sm px-3.5 py-2.5 rounded-btn max-w-[80%] shadow-neumo-out ${m.sender_id === session?.user.id ? 'bg-gradient-to-l from-accent to-accent2 text-bg mr-auto' : 'bg-white/5 text-[#C4C7ED]'}`}>{m.message}</div>
        ))}
        {messages.length === 0 && <div className="text-center text-[#5C5F8A] text-sm py-6">هنوز پیامی نیست.</div>}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className={`${inputCls} flex-1`} placeholder="پیام..." onKeyDown={(e) => e.key === 'Enter' && send()} />
        <button onClick={send} className={`${btnCls} !px-4`}>ارسال</button>
      </div>
    </div>
  )
      }
