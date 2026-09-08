import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Enrollment, Upload, Announcement, CourseMaterial, StudentDocument, Testimonial } from '../../lib/supabase'

type ChatMsg = { id: string; enrollment_id: string; sender_id: string; message: string; created_at: string }

const TABS = ['دوره‌های من', 'چت با مدرس', 'پشتیبانی', 'جزوات کلاس', 'فایل‌های من', 'مدارک من', 'اطلاعیه‌ها', 'ثبت نظر', 'پروفایل'] as const

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
          <button key={t} onClick={() => setTab(t)} className={`relative py-2.5 rounded-lg font-medium transition-colors ${tab === t ? 'bg-accent text-bg' : 'text-[#A8ACD9]'}`}>
            {t}
            {t === 'مدارک من' && hasUnseenDocs && (
              <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-[#FB7185]"></span>
            )}
          </button>
        ))}
      </div>

      {tab === 'دوره‌های من' && (
        <div className="space-y-3">
          {enrollments.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز در دوره‌ای ثبت‌نام نکرده‌ای.</div>}
          {enrollments.map((e) => (
