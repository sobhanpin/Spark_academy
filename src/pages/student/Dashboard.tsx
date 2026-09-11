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
      <h1 className="text-xl sm:text-2xl font-black mb-5">سلام {profile?.name} 👋</h1>

      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 glass-panel p-1.5 rounded-2xl mb-6 text-xs">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative py-2.5 rounded-btn font-medium transition-all duration-300 ${
              tab === t ? 'bg-gradient-to-l from-accent to-accent2 text-bg font-bold shadow-glow-gold' : 'text-[#A8ACD9] hover:bg-white/5'
            }`}
          >
            {t}
            {t === 'مدارک من' && hasUnseenDocs && (
              <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-[#FB7185] shadow-[0_0_6px_rgba(251,113,133,0.7)]"></span>
            )}
          </button>
        ))}
      </div>

      {tab === 'دوره‌های من' && (
        <div className="space-y-3">
          {enrollments.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز در دوره‌ای ثبت‌نام نکرده‌ای.</div>}
          {enrollments.map((e) => (
            <div key={e.id} className="glass-panel rounded-card p-5 transition-transform duration-300 ease-smooth-3d hover:-translate-y-0.5">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold">{e.courses?.title}</h3>
                <span className={`text-[11px] px-2.5 py-1 rounded-pill font-bold shadow-neumo-out ${e.payment_status === 'paid' ? 'bg-[#34D399]/15 text-[#34D399]' : 'bg-accent/15 text-accent'}`}>
                  {e.payment_status === 'paid' ? 'پرداخت‌شده' : 'در انتظار پرداخت حضوری'}
                </span>
              </div>
              <div className="text-xs text-[#7B7FB5]">{e.class_mode === 'in_person' ? 'حضوری' : 'آنلاین'} · {e.courses?.schedule || 'زمان‌بندی به‌زودی اعلام می‌شود'}</div>
              {e.class_mode === 'online' && e.courses?.online_link && (
                <a href={e.courses.online_link} target="_blank" rel="noreferrer" className="inline-block mt-2.5 text-xs bg-violet/20 text-[#D8D7FF] px-3.5 py-2 rounded-btn shadow-neumo-out hover:-translate-y-0.5 transition-transform duration-300">🔗 ورود به کلاس آنلاین</a>
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
            <button key={e.id} onClick={() => setActiveChat(e)} className="glass-panel rounded-btn p-4 w-full text-right flex items-center justify-between transition-transform duration-300 hover:-translate-y-0.5">
              <span className="text-sm font-medium">{e.courses?.title}</span>
              <span className="text-accent text-xs">گفتگو ←</span>
            </button>
          ))}
          {enrollments.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز در دوره‌ای ثبت‌نام نکرده‌ای.</div>}
        </div>
      )}

      {tab === 'پشتیبانی' && <SupportChat />}

      {tab === 'جزوات کلاس' && (
        <div className="space-y-2.5">
          {materials.map((m) => (
            <button key={m.id} onClick={() => openFile('materials', m.file_path)} className="glass-panel rounded-btn p-4 w-full text-right block transition-transform duration-300 hover:-translate-y-0.5">
              <div className="text-sm font-medium truncate">{m.file_name}</div>
              <div className="text-xs text-[#7B7FB5] mt-1">{m.courses?.title} · {m.profiles?.name}</div>
            </button>
          ))}
          {materials.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز جزوه‌ای برای دوره‌هات آپلود نشده.</div>}
        </div>
      )}

      {tab === 'فایل‌های من' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-card p-5">
            <label className="block text-xs text-[#7B7FB5] mb-1.5">برای کدام دوره؟ (اختیاری)</label>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300 mb-3">
              <option value="">انتخاب نشده</option>
              {enrollments.map((e) => <option key={e.course_id} value={e.course_id}>{e.courses?.title}</option>)}
            </select>
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
            <button
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-white/15 rounded-btn py-6 text-sm text-[#A8ACD9] shadow-neumo-in hover:border-accent/40 transition-colors duration-300 disabled:opacity-60"
            >
              {busy ? 'در حال آپلود...' : '📎 عکس یا PDF رو انتخاب کن'}
            </button>
          </div>
          <div className="space-y-2.5">
            {uploads.map((u) => (
              <div key={u.id} className="glass-panel rounded-btn p-3.5 flex items-center justify-between">
                <button onClick={() => openFile('uploads', u.file_path)} className="text-sm text-right truncate flex-1 hover:text-accent transition-colors duration-300">{u.file_name}</button>
                <button onClick={() => deleteFile(u)} className="text-[#FB7185] text-xs px-2 hover:opacity-70 transition-opacity duration-300">حذف</button>
              </div>
            ))}
            {uploads.length === 0 && <div className="text-center py-6 text-[#5C5F8A] text-sm">هنوز فایلی آپلود نکرده‌ای.</div>}
          </div>
        </div>
      )}

      {tab === 'مدارک من' && (
        <div className="space-y-2.5">
          {studentDocs.map((d) => (
            <button key={d.id} onClick={() => openFile('student-documents', d.file_path)} className="glass-panel rounded-btn p-4 w-full text-right flex items-center justify-between transition-transform duration-300 hover:-translate-y-0.5">
              <span className="text-sm font-medium">{d.title}</span>
              <span className="text-accent text-xs">دانلود ←</span>
            </button>
          ))}
          {studentDocs.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز مدرکی برات آپلود نشده.</div>}
        </div>
      )}

      {tab === 'اطلاعیه‌ها' && (
        <div className="space-y-2.5">
          {announcements.map((a) => <div key={a.id} className="glass-panel rounded-btn p-4 text-sm">{a.text}</div>)}
          {announcements.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">اطلاعیه‌ای وجود ندارد.</div>}
        </div>
      )}

      {tab === 'ثبت نظر' && <StudentTestimonialForm defaultName={profile?.name || ''} />}

      {tab === 'پروفایل' && (
        <form className="glass-panel rounded-card p-5 space-y-4" onSubmit={(e) => { e.preventDefault(); updateProfile(new FormData(e.currentTarget)) }}>
          <div>
            <label className="block text-xs text-[#7B7FB5] mb-1.5">نام</label>
            <input name="name" defaultValue={profile?.name} className="input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300" />
          </div>
          <div>
            <label className="block text-xs text-[#7B7FB5] mb-1.5">شماره تماس</label>
            <input name="phone" defaultValue={profile?.phone || ''} className="input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300" />
          </div>
          <button className="btn-primary w-full rounded-btn shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform duration-300">ذخیره تغییرات</button>
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

  const submit = async () => {
    if (!session || !name.trim() || !text.trim()) { showToast('نام و متن نظر رو پر کن', 'error'); return }
    setBusy(true)
    const { error } = await supabase.from('testimonials').insert({ user_id: session.user.id, student_name: name.trim(), text: text.trim(), approved: false })
    setBusy(false)
    if (error) { showToast('خطا در ارسال نظر: ' + error.message, 'error'); return }
    setText('')
    setSent(true)
  }

  if (sent) {
    return (
      <div className="glass-panel rounded-card text-center py-10">
        <div className="w-14 h-14 mx-auto rounded-full bg-white/5 shadow-neumo-out grid place-items-center text-2xl mb-3">🙏</div>
        <div className="text-sm text-[#C4C7ED]">نظرت ثبت شد و بعد از تأیید آموزشگاه روی سایت نمایش داده می‌شود.</div>
        <button onClick={() => setSent(false)} className="text-accent text-xs mt-4 hover:underline transition-colors duration-300">ثبت نظر دیگر</button>
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-card p-5 space-y-4">
      <div className="text-sm font-bold">نظرت رو با ما در میون بذار</div>
      <div>
        <label className="block text-xs text-[#7B7FB5] mb-1.5">نام</label>
        <input className="input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs text-[#7B7FB5] mb-1.5">متن نظر</label>
        <textarea className="input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300 resize-none" rows={4} placeholder="تجربه‌ت از دوره چطور بود؟" value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <button onClick={submit} disabled={busy} className="btn-primary w-full rounded-btn shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform duration-300 disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0">
        {busy ? 'در حال ارسال...' : 'ارسال نظر'}
      </button>
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
        <input value={text} onChange={(e) => setText(e.target.value)} className="input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300 flex-1" placeholder="پیام..." onKeyDown={(e) => e.key === 'Enter' && send()} />
        <button onClick={send} className="btn-primary !px-4 rounded-btn shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-300">ارسال</button>
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
    <div className="glass-panel rounded-card p-5">
      <div className="font-bold text-sm mb-3">پشتیبانی آموزشگاه</div>
      <div className="space-y-2 max-h-80 overflow-y-auto mb-3">
        {messages.map((m: any) => (
          <div key={m.id} className={`text-sm px-3.5 py-2.5 rounded-btn max-w-[80%] shadow-neumo-out ${m.sender_id === session?.user.id ? 'bg-gradient-to-l from-accent to-accent2 text-bg mr-auto' : 'bg-white/5 text-[#C4C7ED]'}`}>{m.message}</div>
        ))}
        {messages.length === 0 && <div className="text-center text-[#5C5F8A] text-sm py-6">برای شروع، پیامت رو بفرست.</div>}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300 flex-1" placeholder="پیام به پشتیبانی..." onKeyDown={(e) => e.key === 'Enter' && send()} />
        <button onClick={send} className="btn-primary !px-4 rounded-btn shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-300">ارسال</button>
      </div>
    </div>
  )
                                                                                                                                   }
