import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Enrollment, Upload, Announcement, CourseMaterial, StudentDocument } from '../../lib/supabase'

type ChatMsg = { id: string; enrollment_id: string; sender_id: string; message: string; created_at: string }

const TABS = ['دوره‌های من', 'چت با مدرس', 'جزوات کلاس', 'فایل‌های من', 'مدارک من', 'اطلاعیه‌ها', 'پروفایل'] as const

export default function StudentDashboard() {
  const { session, profile, refreshProfile } = useAuth()
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
    setStudentDocs(sd || [])
    const { data: an } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(10)
    setAnnouncements((an as Announcement[]) || [])
  }

  useEffect(() => { load() }, [session])

  const uploadFile = async (file: File) => {
    if (!session || !file) return
    if (file.size > 10 * 1024 * 1024) { alert('حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.'); return }
    setBusy(true)
    const path = `${session.user.id}/${Date.now()}_${file.name}`
    const { error: upErr } = await supabase.storage.from('uploads').upload(path, file)
    if (!upErr) {
      await supabase.from('uploads').insert({ user_id: session.user.id, course_id: selectedCourse || null, file_name: file.name, file_path: path, file_type: file.type, size_kb: Math.round(file.size / 1024) })
      await load()
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
    alert('پروفایل به‌روزرسانی شد.')
  }

  if (activeChat) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => setActiveChat(null)} className="text-sm text-accent mb-4">← برگشت</button>
        <ChatBox enrollmentId={activeChat.id} title={activeChat.courses?.title || ''} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-black mb-4">سلام {profile?.name} 👋</h1>

      <div className="grid grid-cols-3 gap-1 bg-bgsoft p-1 rounded-xl border border-white/5 mb-5 text-xs">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`py-2.5 rounded-lg font-medium transition-colors ${tab === t ? 'bg-accent text-bg' : 'text-[#A8ACD9]'}`}>{t}</button>
        ))}
      </div>

      {tab === 'دوره‌های من' && (
        <div className="space-y-3">
          {enrollments.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز در دوره‌ای ثبت‌نام نکرده‌ای.</div>}
          {enrollments.map((e) => (
            <div key={e.id} className="card">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold">{e.courses?.title}</h3>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${e.payment_status === 'paid' ? 'bg-[#34D399]/15 text-[#34D399]' : 'bg-accent/15 text-accent'}`}>
                  {e.payment_status === 'paid' ? 'پرداخت‌شده' : 'در انتظار پرداخت حضوری'}
                </span>
              </div>
              <div className="text-xs text-[#7B7FB5]">{e.class_mode === 'in_person' ? 'حضوری' : 'آنلاین'} · {e.courses?.schedule || 'زمان‌بندی به‌زودی اعلام می‌شود'}</div>
              {e.class_mode === 'online' && e.courses?.online_link && (
                <a href={e.courses.online_link} target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs bg-violet/20 text-[#D8D7FF] px-3 py-1.5 rounded-lg">🔗 ورود به کلاس آنلاین</a>
              )}
              {e.completed && (
                <div className="mt-2 text-sm text-accent font-bold">{e.certificate_issued ? '🎓 گواهی پایان دوره صادر شد' : '✅ دوره تکمیل شد'}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'چت با مدرس' && (
        <div className="space-y-2">
          {enrollments.map((e) => (
            <button key={e.id} onClick={() => setActiveChat(e)} className="card !py-3 w-full text-right flex items-center justify-between">
              <span className="text-sm font-medium">{e.courses?.title}</span>
              <span className="text-accent text-xs">گفتگو ←</span>
            </button>
          ))}
          {enrollments.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز در دوره‌ای ثبت‌نام نکرده‌ای.</div>}
        </div>
      )}

      {tab === 'جزوات کلاس' && (
        <div className="space-y-2">
          {materials.map((m) => (
            <button key={m.id} onClick={() => openFile('materials', m.file_path)} className="card !py-3 w-full text-right block">
              <div className="text-sm font-medium truncate">{m.file_name}</div>
              <div className="text-xs text-[#7B7FB5] mt-1">{m.courses?.title} · {m.profiles?.name}</div>
            </button>
          ))}
          {materials.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز جزوه‌ای برای دوره‌هات آپلود نشده.</div>}
        </div>
      )}

      {tab === 'فایل‌های من' && (
        <div className="space-y-4">
          <div className="card">
            <label className="block text-xs text-[#7B7FB5] mb-1.5">برای کدام دوره؟ (اختیاری)</label>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="input mb-3">
              <option value="">انتخاب نشده</option>
              {enrollments.map((e) => <option key={e.course_id} value={e.course_id}>{e.courses?.title}</option>)}
            </select>
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
            <button disabled={busy} onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-white/15 rounded-xl py-6 text-sm text-[#A8ACD9]">{busy ? 'در حال آپلود...' : '📎 عکس یا PDF رو انتخاب کن'}</button>
          </div>
          <div className="space-y-2">
            {uploads.map((u) => (
              <div key={u.id} className="card !py-3 flex items-center justify-between">
                <button onClick={() => openFile('uploads', u.file_path)} className="text-sm text-right truncate flex-1">{u.file_name}</button>
                <button onClick={() => deleteFile(u)} className="text-[#FB7185] text-xs px-2">حذف</button>
              </div>
            ))}
            {uploads.length === 0 && <div className="text-center py-6 text-[#5C5F8A] text-sm">هنوز فایلی آپلود نکرده‌ای.</div>}
          </div>
        </div>
      )}

      {tab === 'مدارک من' && (
        <div className="space-y-2">
          {studentDocs.map((d) => (
            <button key={d.id} onClick={() => openFile('student-documents', d.file_path)} className="card !py-3 w-full text-right flex items-center justify-between">
              <span className="text-sm font-medium">{d.title}</span>
              <span className="text-accent text-xs">دانلود ←</span>
            </button>
          ))}
          {studentDocs.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز مدرکی برات آپلود نشده.</div>}
        </div>
      )}

      {tab === 'اطلاعیه‌ها' && (
        <div className="space-y-2">
          {announcements.map((a) => <div key={a.id} className="card !py-3 text-sm">{a.text}</div>)}
          {announcements.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">اطلاعیه‌ای وجود ندارد.</div>}
        </div>
      )}

      {tab === 'پروفایل' && (
        <form className="card space-y-3" onSubmit={(e) => { e.preventDefault(); updateProfile(new FormData(e.currentTarget)) }}>
          <div>
            <label className="block text-xs text-[#7B7FB5] mb-1">نام</label>
            <input name="name" defaultValue={profile?.name} className="input" />
          </div>
          <div>
            <label className="block text-xs text-[#7B7FB5] mb-1">شماره تماس</label>
            <input name="phone" defaultValue={profile?.phone || ''} className="input" />
          </div>
          <button className="btn-primary w-full">ذخیره تغییرات</button>
        </form>
      )}
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
    <div className="card">
      <div className="font-bold text-sm mb-3">{title}</div>
      <div className="space-y-2 max-h-80 overflow-y-auto mb-3">
        {messages.map((m) => (
          <div key={m.id} className={`text-sm px-3 py-2 rounded-xl max-w-[80%] ${m.sender_id === session?.user.id ? 'bg-accent text-bg mr-auto' : 'bg-white/5 text-[#C4C7ED]'}`}>{m.message}</div>
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
