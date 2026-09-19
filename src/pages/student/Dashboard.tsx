import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Enrollment, Upload, Announcement, CourseMaterial, StudentDocument, Testimonial } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'

type ChatMsg = { id: string; enrollment_id: string; sender_id: string; message: string; created_at: string }

const TABS = ['دوره‌های من', 'چت با مدرس', 'پشتیبانی', 'جزوات کلاس', 'فایل‌های من', 'مدارک من', 'اطلاعیه‌ها', 'ثبت نظر', 'پروفایل'] as const

export default function StudentDashboard() {
  const { session, profile, refreshProfile } = useAuth()
  const { showToast } = useToast()
  const [tab, setTab] = useState<(typeof TABS)[number]>('دوره‌های من')
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [materials, setMaterials] = useState<CourseMaterial[]>([])
  const [uploads, setUploads] = useState<Upload[]>([])
  const [studentDocs, setStudentDocs] = useState<StudentDocument[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [busy, setBusy] = useState(false)
  const [activeChat, setActiveChat] = useState<Enrollment | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const hasUnseenDocs = studentDocs.some((d) => !d.seen)

  const load = async () => {
    if (!session) return
    const { data: en } = await supabase.from('enrollments').select('*, courses(*)').eq('user_id', session.user.id).order('enrolled_at', { ascending: false })
    setEnrollments((en as Enrollment[]) || [])
    const courseIds = ((en as Enrollment[]) || []).map((e) => e.course_id)
    if (courseIds.length > 0) {
      const { data: mat } = await supabase.from('course_materials').select('*, courses(*), profiles(*)').in('course_id', courseIds)
      setMaterials((mat as CourseMaterial[]) || [])
    }
    const { data: up } = await supabase.from('uploads').select('*').eq('user_id', session.user.id).order('uploaded_at', { ascending: false })
    setUploads((up as Upload[]) || [])
    const { data: sd } = await supabase.from('student_documents').select('*').eq('user_id', session.user.id).order('uploaded_at', { ascending: false })
    setStudentDocs((sd as StudentDocument[]) || [])
    const { data: an } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(10)
    setAnnouncements((an as Announcement[]) || [])
  }

  useEffect(() => { load() }, [session])

  useEffect(() => {
    if (tab === 'مدارک من' && session && studentDocs.some((d) => !d.seen)) {
      supabase.from('student_documents').update({ seen: true }).eq('user_id', session.user.id).eq('seen', false).then(() => {
        setStudentDocs((docs) => docs.map((d) => ({ ...d, seen: true })))
      })
    }
  }, [tab, session])

  const uploadFile = async (file: File) => {
    if (!session || !file) return
    if (file.size > 10 * 1024 * 1024) { showToast('حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.', 'error'); return }
    setBusy(true)
    const path = `${session.user.id}/${Date.now()}_${file.name}`
    const { error: upErr } = await supabase.storage.from('uploads').upload(path, file)
    if (!upErr) {
      await supabase.from('uploads').insert({ user_id: session.user.id, course_id: selectedCourse || null, file_name: file.name, file_path: path, file_type: file.type, size_kb: Math.round(file.size / 1024) })
      await load()
      showToast('فایل آپلود شد.')
    } else {
      showToast('خطا در آپلود: ' + upErr.message, 'error')
    }
    setBusy(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const openFile = async (bucket: string, path: string) => {
    const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const deleteFile = async (u: Upload) => {
    await supabase.storage.from('uploads').remove([u.file_path])
    await supabase.from('uploads').delete().eq('id', u.id)
    load()
  }

  const updateProfile = async (form: FormData) => {
    if (!session) return
    await supabase.from('profiles').update({ name: form.get('name') as string, phone: form.get('phone') as string }).eq('id', session.user.id)
    await refreshProfile()
    showToast('پروفایل به‌روزرسانی شد.')
  }

  if (activeChat) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => setActiveChat(null)} className="text-sm text-accent mb-4 hover:-translate-x-0.5 transition-transform duration-300 inline-block">← برگشت</button>
        <ChatBox enrollmentId={activeChat.id} title={activeChat.courses?.title || ''} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="dash-header">سلام {profile?.name} 👋</h1>

      <div className="dash-tabs grid-cols-3 sm:grid-cols-5 lg:grid-cols-9">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`dash-tab ${tab === t ? 'active' : ''}`}>
            {t}
            {t === 'مدارک من' && hasUnseenDocs && <span className="dash-notify-dot" />}
          </button>
        ))}
      </div>

      {tab === 'دوره‌های من' && (
        <div className="space-y-3">
          {enrollments.length === 0 && <div className="dash-empty">هنوز در دوره‌ای ثبت‌نام نکرده‌ای.</div>}
          {enrollments.map((e) => (
            <div key={e.id} className="dash-card">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold">{e.courses?.title}</h3>
                <span className={`dash-badge ${e.payment_status === 'paid' ? 'dash-badge-success' : 'dash-badge-pending'}`}>
                  {e.payment_status === 'paid' ? 'پرداخت‌شده' : 'در انتظار پرداخت حضوری'}
                </span>
              </div>
              <div className="text-xs text-[#7B7FB5]">{e.class_mode === 'in_person' ? 'حضوری' : 'آنلاین'} · {e.courses?.schedule || 'زمان‌بندی به‌زودی اعلام می‌شود'}</div>
              {e.class_mode === 'online' && e.courses?.online_link && (
                <a href={e.courses.online_link} target="_blank" rel="noreferrer" className="dash-btn-mini dash-btn-violet inline-block mt-2.5">🔗 ورود به کلاس آنلاین</a>
              )}
              {e.completed && (
                <div className="mt-2.5 text-sm text-accent font-bold">{e.certificate_issued ? '🎓 گواهی پایان دوره صادر شد' : '✅ دوره تکمیل شد'}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'چت با مدرس' && (
        <div className="space-y-2.5">
          {enrollments.map((e) => (
            <button key={e.id} onClick={() => setActiveChat(e)} className="dash-card w-full text-right flex items-center justify-between">
              <span className="text-sm font-medium">{e.courses?.title}</span>
              <span className="text-accent text-xs">گفتگو ←</span>
            </button>
          ))}
          {enrollments.length === 0 && <div className="dash-empty">هنوز در دوره‌ای ثبت‌نام نکرده‌ای.</div>}
        </div>
      )}

      {tab === 'پشتیبانی' && <SupportChat />}

      {tab === 'جزوات کلاس' && (
        <div className="space-y-2.5">
          {materials.map((m) => (
            <button key={m.id} onClick={() => openFile('materials', m.file_path)} className="dash-card w-full text-right block">
              <div className="text-sm font-medium truncate">{m.file_name}</div>
              <div className="text-xs text-[#7B7FB5] mt-1">{m.courses?.title} · {m.profiles?.name}</div>
            </button>
          ))}
          {materials.length === 0 && <div className="dash-empty">هنوز جزوه‌ای برای دوره‌هات آپلود نشده.</div>}
        </div>
      )}

      {tab === 'فایل‌های من' && (
        <div className="space-y-4">
          <div className="dash-card">
            <label className="auth-label">برای کدام دوره؟ (اختیاری)</label>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="input-3d mb-3">
              <option value="">انتخاب نشده</option>
              {enrollments.map((e) => <option key={e.course_id} value={e.course_id}>{e.courses?.title}</option>)}
            </select>
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
            <button disabled={busy} onClick={() => fileRef.current?.click()} className="dash-dropzone w-full">
              {busy ? 'در حال آپلود...' : '📎 عکس یا PDF رو انتخاب کن'}
            </button>
          </div>
          <div className="space-y-2.5">
            {uploads.map((u) => (
              <div key={u.id} className="dash-card flex items-center justify-between">
                <button onClick={() => openFile('uploads', u.file_path)} className="text-sm text-right truncate flex-1 hover:text-accent transition-colors duration-300">{u.file_name}</button>
                <button onClick={() => deleteFile(u)} className="dash-btn-mini dash-btn-danger">حذف</button>
              </div>
            ))}
            {uploads.length === 0 && <div className="dash-empty">هنوز فایلی آپلود نکرده‌ای.</div>}
          </div>
        </div>
      )}

      {tab === 'مدارک من' && (
        <div className="space-y-2.5">
          {studentDocs.map((d) => (
            <button key={d.id} onClick={() => openFile('student-documents', d.file_path)} className="dash-card w-full text-right flex items-center justify-between">
              <span className="text-sm font-medium">{d.title}</span>
              <span className="text-accent text-xs">دانلود ←</span>
            </button>
          ))}
          {studentDocs.length === 0 && <div className="dash-empty">هنوز مدرکی برات آپلود نشده.</div>}
        </div>
      )}

      {tab === 'اطلاعیه‌ها' && (
        <div className="space-y-2.5">
          {announcements.map((a) => <div key={a.id} className="dash-card text-sm">{a.text}</div>)}
          {announcements.length === 0 && <div className="dash-empty">اطلاعیه‌ای وجود ندارد.</div>}
        </div>
      )}

      {tab === 'ثبت نظر' && <StudentTestimonialForm defaultName={profile?.name || ''} />}

      {tab === 'پروفایل' && (
        <form className="dash-card space-y-4" onSubmit={(e) => { e.preventDefault(); updateProfile(new FormData(e.currentTarget)) }}>
          <div>
            <label className="auth-label">نام</label>
            <input name="name" defaultValue={profile?.name} className="input-3d" />
          </div>
          <div>
            <label className="auth-label">شماره تماس</label>
            <input name="phone" defaultValue={profile?.phone || ''} className="input-3d" />
          </div>
          <button className="hero-primary-btn w-full justify-center">ذخیره تغییرات</button>
        </form>
      )}
    </div>
  )
}

function StudentTestimonialForm({ defaultName }: { defaultName: string }) {
  const { session } = useAuth()
  const { showToast } = useToast()
  const [name, setName] = useState(defaultName)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [mine, setMine] = useState<Testimonial[]>([])

  const loadMine = async () => {
    if (!session) return
    const { data } = await supabase.from('testimonials').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
    setMine((data as Testimonial[]) || [])
  }

  useEffect(() => { loadMine() }, [session])

  const submit = async () => {
    if (!session || !name.trim() || !text.trim()) { showToast('نام و متن نظر رو پر کن', 'error'); return }
    setBusy(true)
    const { error } = await supabase.from('testimonials').insert({ user_id: session.user.id, student_name: name.trim(), text: text.trim(), approved: false, status: 'pending' })
    setBusy(false)
    if (error) { showToast('خطا در ارسال نظر: ' + error.message, 'error'); return }
    setText('')
    setSent(true)
    loadMine()
  }

  const statusLabel = (s?: string) => (s === 'approved' ? 'تأیید شده' : s === 'rejected' ? 'رد شده' : 'در انتظار بررسی')
  const statusClass = (s?: string) => (s === 'approved' ? 'dash-badge-success' : s === 'rejected' ? 'dash-badge-danger' : 'dash-badge-pending')

  const MyList = mine.length > 0 && (
    <div className="space-y-2.5">
      <div className="text-sm font-bold px-1">نظرات قبلی من</div>
      {mine.map((t) => (
        <div key={t.id} className="dash-card">
          <div className="text-sm">{t.text}</div>
          <div className="flex justify-between items-center mt-2">
            <span className={`dash-badge ${statusClass(t.status)}`}>{statusLabel(t.status)}</span>
          </div>
        </div>
      ))}
    </div>
  )

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="dash-card text-center py-10">
          <div className="text-2xl mb-2">🙏</div>
          <div className="text-sm text-[#C4C7ED]">نظرت ثبت شد و بعد از تأیید آموزشگاه روی سایت نمایش داده می‌شود.</div>
          <button onClick={() => setSent(false)} className="text-accent text-xs mt-4 hover:underline transition-colors duration-300">ثبت نظر دیگر</button>
        </div>
        {MyList}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="dash-card space-y-4">
        <div className="text-sm font-bold">نظرت رو با ما در میون بذار</div>
        <div>
          <label className="auth-label">نام</label>
          <input className="input-3d" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="auth-label">متن نظر</label>
          <textarea className="input-3d resize-none" rows={4} placeholder="تجربه‌ت از دوره چطور بود؟" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <button onClick={submit} disabled={busy} className="hero-primary-btn w-full justify-center disabled:opacity-60 disabled:pointer-events-none">{busy ? 'در حال ارسال...' : 'ارسال نظر'}</button>
      </div>
      {MyList}
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

function SupportChat() {
  const { session } = useAuth()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [text, setText] = useState('')
  const load = () => {
    if (!session) return
    supabase.from('support_messages').select('*').eq('user_id', session.user.id).order('created_at').then(({ data }) => setMessages((data as any) || []))
  }
  useEffect(() => { load() }, [session])
  const send = async () => {
    if (!text.trim() || !session) return
    await supabase.from('support_messages').insert({ user_id: session.user.id, sender_id: session.user.id, message: text.trim() })
    setText(''); load()
  }
  return (
    <div className="chat-panel">
      <div className="font-bold text-sm mb-3">پشتیبانی آموزشگاه</div>
      <div className="chat-scroll">
        {messages.map((m: any) => (
          <div key={m.id} className={`chat-bubble ${m.sender_id === session?.user.id ? 'chat-bubble-mine' : 'chat-bubble-theirs'}`}>{m.message}</div>
        ))}
        {messages.length === 0 && <div className="dash-empty">برای شروع، پیامت رو بفرست.</div>}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="input-3d flex-1" placeholder="پیام به پشتیبانی..." onKeyDown={(e) => e.key === 'Enter' && send()} />
        <button onClick={send} className="hero-primary-btn !px-4">ارسال</button>
      </div>
    </div>
  )
      }
