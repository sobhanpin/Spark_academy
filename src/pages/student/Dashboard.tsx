import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Course, Enrollment, CourseMaterial } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'

type ChatMsg = { id: string; enrollment_id: string; sender_id: string; message: string; created_at: string }

const TABS = ['دوره‌های من', 'دانشجویان و چت', 'جزوات', 'گفتگو با مدیریت'] as const

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
      <h1 className="dash-header">پنل مدرس — سلام {profile?.name} 👋</h1>
      <div className="dash-tabs grid-cols-2 sm:grid-cols-4">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`dash-tab ${tab === t ? 'active' : ''}`}>{t}</button>
        ))}
      </div>

      {tab === 'دوره‌های من' && (
        <div className="space-y-2.5">
          {courses.map((c) => (
            <TeacherCourseCard key={c.id} course={c} onSaved={loadCourses} />
          ))}
          {courses.length === 0 && <div className="dash-empty">هنوز دوره‌ای به تو اختصاص داده نشده.</div>}
        </div>
      )}

      {tab === 'دانشجویان و چت' && (
        <div className="space-y-2.5">
          {enrollments.map((e) => (
            <button key={e.id} onClick={() => setActiveEnrollment(e)} className="dash-card w-full text-right flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">{e.profiles?.name}</div>
                <div className="text-xs text-[#7B7FB5]">{e.courses?.title} · {e.class_mode === 'in_person' ? 'حضوری' : 'آنلاین'}</div>
              </div>
              <span className="text-accent text-xs">گفتگو ←</span>
            </button>
          ))}
          {enrollments.length === 0 && <div className="dash-empty">هنوز دانشجویی ثبت‌نام نکرده.</div>}
        </div>
      )}

      {tab === 'جزوات' && <TeacherMaterials courses={courses} />}

      {tab === 'گفتگو با مدیریت' && (
        <div className="dash-card text-center text-sm text-[#8B8FC0] py-10">برای هماهنگی با مدیریت، از طریق شماره تماس آموزشگاه (پایین سایت) اقدام کن.</div>
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
    <div className="dash-card">
      <div className="font-bold text-sm">{course.title}</div>
      <div className="text-xs text-[#7B7FB5] mt-1">{course.mode === 'both' ? 'حضوری و آنلاین' : course.mode === 'in_person' ? 'حضوری' : 'آنلاین'} · {course.category}</div>

      {canHaveOnlineLink && (
        <div className="mt-2.5">
          {editingLink ? (
            <div className="flex gap-2 items-center">
              <input
                className="input-3d !py-1.5 text-xs flex-1"
                placeholder="لینک کلاس آنلاین (اسکای‌روم/گوگل‌میت و غیره)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
              <button onClick={save} disabled={busy} className="dash-btn-mini dash-btn-gold shrink-0">{busy ? '...' : 'ذخیره'}</button>
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
      const { error: dbErr } = await supabase.from('course_materials').insert({ course_id: courseId, teacher_id: session.user.id, file_name: file.name, file_path: path })
      if (dbErr) {
        showToast('خطا در ثبت جزوه: ' + dbErr.message, 'error')
      } else {
        setFile(null); load()
        showToast('جزوه آپلود شد.')
      }
    } else {
      showToast('خطا در آپلود: ' + error.message, 'error')
    }
    setBusy(false)
  }

  const remove = async (m: CourseMaterial) => {
    const { error: storageErr } = await supabase.storage.from('materials').remove([m.file_path])
    if (storageErr) { showToast('خطا در حذف فایل: ' + storageErr.message, 'error'); return }
    const { error } = await supabase.from('course_materials').delete().eq('id', m.id)
    if (error) { showToast('خطا در حذف جزوه: ' + error.message, 'error'); return }
    load()
  }

  const openFile = async (path: string) => {
    const { data } = await supabase.storage.from('materials').createSignedUrl(path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  return (
    <div className="space-y-3">
      <div className="dash-card space-y-2">
        <select className="input-3d" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">انتخاب دوره</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input-3d" />
        <button onClick={upload} disabled={busy} className="hero-primary-btn w-full justify-center">{busy ? 'در حال آپلود...' : 'آپلود جزوه'}</button>
      </div>
      {items.map((m) => (
        <div key={m.id} className="dash-card flex items-center justify-between">
          <button onClick={() => openFile(m.file_path)} className="text-right flex-1 truncate hover:text-accent transition-colors duration-300">
            <div className="text-sm font-medium truncate">{m.file_name}</div>
            <div className="text-xs text-[#7B7FB5]">{m.courses?.title}</div>
          </button>
          <button onClick={() => remove(m)} className="dash-btn-mini dash-btn-danger">حذف</button>
        </div>
      ))}
      {items.length === 0 && <div className="dash-empty">هنوز جزوه‌ای آپلود نکردی.</div>}
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
    <div className="chat-panel">
      <div className="font-bold text-sm mb-3">{title}</div>
      <div className="chat-scroll">
        {messages.map((m) => (
          <div key={m.id} className={`chat-bubble ${m.sender_id === session?.user.id ? 'chat-bubble-mine' : 'chat-bubble-theirs'}`}>{m.message}</div>
        ))}
        {messages.length === 0 && <div className="dash-empty">هنوز پیامی نیست.</div>}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="input-3d flex-1" placeholder="پیام..." onKeyDown={(e) => e.key === 'Enter' && send()} />
        <button onClick={send} className="hero-primary-btn !px-4">ارسال</button>
      </div>
    </div>
  )
          }
