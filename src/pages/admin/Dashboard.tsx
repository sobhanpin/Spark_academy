import { useEffect, useState } from 'react'
import { supabase, Course, Enrollment, Testimonial, NewsItem, FaqItem, AcademyDocument, Profile, CourseMaterial } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
const TABS = ['دوره‌ها', 'دانشجویان', 'مدرسین', 'جزوات دوره', 'پشتیبانی', 'نظرات', 'اخبار', 'FAQ', 'پیام‌ها', 'اطلاعیه', 'مدارک آموزشگاه', 'تنظیمات'] as const

export default function AdminDashboard() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('دوره‌ها')
  return (
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="dash-header">پنل مدیریت</h1>
      <div className="dash-tabs flow">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`dash-tab !px-3.5 ${tab === t ? 'active' : ''}`}>{t}</button>
        ))}
      </div>
      {tab === 'دوره‌ها' && <CoursesTab />}
      {tab === 'دانشجویان' && <StudentsTab />}
      {tab === 'مدرسین' && <TeachersTab />}
      {tab === 'جزوات دوره' && <MaterialsTab />}
      {tab === 'پشتیبانی' && <AdminSupportTab />}
      {tab === 'نظرات' && <TestimonialsTab />}
      {tab === 'اخبار' && <NewsTab />}
      {tab === 'FAQ' && <FaqTab />}
      {tab === 'پیام‌ها' && <MessagesTab />}
      {tab === 'اطلاعیه' && <AnnouncementTab />}
      {tab === 'مدارک آموزشگاه' && <DocumentsTab />}
      {tab === 'تنظیمات' && <SettingsTab />}
    </div>
  )
}

function CoursesTab() {
  const { showToast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Profile[]>([])
  const [editing, setEditing] = useState<Partial<Course> | null>(null)
  const [imgBusy, setImgBusy] = useState(false)
  const load = () => {
    supabase.from('courses').select('*, profiles(*)').order('created_at').then(({ data }) => setCourses((data as Course[]) || []))
    supabase.from('profiles').select('*').eq('role', 'teacher').then(({ data }) => setTeachers(data || []))
  }
  useEffect(() => { load() }, [])
  const uploadImage = async (file: File) => {
    setImgBusy(true)
    const path = `${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('course-images').upload(path, file)
    if (!error) {
      const url = supabase.storage.from('course-images').getPublicUrl(path).data.publicUrl
      setEditing((prev) => (prev ? { ...prev, image_url: url } : prev))
    } else { showToast('خطا در آپلود عکس: ' + error.message, 'error') }
    setImgBusy(false)
  }
  const save = async () => {
    if (!editing) return
    const payload: any = { ...editing }
    delete payload.id
    delete payload.profiles
    const { error } = editing.id
      ? await supabase.from('courses').update(payload).eq('id', editing.id)
      : await supabase.from('courses').insert(payload)
    if (error) { showToast('خطا در ذخیره دوره: ' + error.message, 'error'); return }
    setEditing(null); load()
    showToast('دوره ذخیره شد.')
  }
  const remove = async (id: string) => {
    if (!confirm('حذف شود؟')) return
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) { showToast('خطا در حذف دوره: ' + error.message, 'error'); return }
    load()
    showToast('دوره حذف شد.')
  }
  if (editing) {
    return (
      <div className="dash-card space-y-3">
        <input className="input-3d" placeholder="عنوان دوره" value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
        <div>
          <label className="auth-label">عکس دوره</label>
          {editing.image_url && <img src={editing.image_url} alt="پیش‌نمایش" className="w-full h-32 object-cover rounded-btn mb-2" />}
          <input type="file" accept="image/*" disabled={imgBusy} onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className="input-3d" />
          {imgBusy && <div className="text-xs text-[#7B7FB5] mt-1">در حال آپلود...</div>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select className="input-3d" value={editing.category || 'زبان'} onChange={(e) => setEditing({ ...editing, category: e.target.value as any })}>
            <option>زبان</option><option>کنکور</option><option>فنی</option>
          </select>
          <select className="input-3d" value={editing.mode || 'both'} onChange={(e) => setEditing({ ...editing, mode: e.target.value as any })}>
            <option value="both">حضوری و آنلاین</option><option value="in_person">فقط حضوری</option><option value="online">فقط آنلاین</option>
          </select>
        </div>
        <div>
          <label className="auth-label">مدرس دوره</label>
          <select className="input-3d" value={editing.teacher_id || ''} onChange={(e) => setEditing({ ...editing, teacher_id: e.target.value || null })}>
            <option value="">بدون مدرس مشخص</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        {editing.mode !== 'in_person' && (
          <input className="input-3d" placeholder="لینک کلاس آنلاین (اسکای‌روم/گوگل‌میت و غیره)" value={editing.online_link || ''} onChange={(e) => setEditing({ ...editing, online_link: e.target.value })} />
        )}
        <textarea className="input-3d resize-none" rows={3} placeholder="توضیحات دوره" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
        <textarea className="input-3d resize-none" rows={2} placeholder="توضیح کارگاه عملی (اختیاری)" value={editing.workshop_details || ''} onChange={(e) => setEditing({ ...editing, workshop_details: e.target.value })} />
        <textarea className="input-3d resize-none" rows={2} placeholder="مدارک موردنیاز" value={editing.required_documents || ''} onChange={(e) => setEditing({ ...editing, required_documents: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <input className="input-3d" type="number" placeholder="قیمت (تومان)" value={editing.price || ''} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
          <input className="input-3d" placeholder="مدت دوره" value={editing.duration || ''} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} />
        </div>
        <input className="input-3d" placeholder="زمان‌بندی کلاس‌ها" value={editing.schedule || ''} onChange={(e) => setEditing({ ...editing, schedule: e.target.value })} />
        <input className="input-3d" placeholder="پیش‌نیاز (اختیاری)" value={editing.prerequisite || ''} onChange={(e) => setEditing({ ...editing, prerequisite: e.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
          نمایش در سایت (فعال)
        </label>
        <div className="flex gap-2">
          <button onClick={save} className="hero-primary-btn flex-1 justify-center">ذخیره</button>
          <button onClick={() => setEditing(null)} className="dash-btn-mini dash-btn-ghost !px-4">انصراف</button>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-2.5">
      <button onClick={() => setEditing({ mode: 'both', category: 'زبان', is_active: true })} className="hero-primary-btn w-full justify-center mb-2">+ افزودن دوره جدید</button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {courses.map((c) => (
        <div key={c.id} className="dash-card flex items-center justify-between">
          <div>
            <div className="font-bold text-sm">{c.title} {!c.is_active && <span className="text-[10px] text-[#FB7185]">(غیرفعال)</span>}</div>
            <div className="text-xs text-[#7B7FB5]">{c.category} · {c.price.toLocaleString('fa-IR')} تومان {c.profiles && `· مدرس: ${c.profiles.name}`}</div>
          </div>
          <div className="flex gap-3 text-xs">
            <button onClick={() => setEditing(c)} className="text-accent hover:underline transition-colors duration-300">ویرایش</button>
            <button onClick={() => remove(c.id)} className="text-[#FB7185] hover:underline transition-colors duration-300">حذف</button>
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}

function StudentsTab() {
  const { showToast } = useToast()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [uploadFor, setUploadFor] = useState<Enrollment | null>(null)
  const [docTitle, setDocTitle] = useState('')
  const [docFile, setDocFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const load = () =>
    supabase.from('enrollments').select('*, courses(*), profiles(*)').order('enrolled_at', { ascending: false }).then(({ data }) => setEnrollments((data as Enrollment[]) || []))
  useEffect(() => { load() }, [])
  const confirmPayment = async (id: string) => {
    const { error } = await supabase.from('enrollments').update({ payment_status: 'paid', confirmed_at: new Date().toISOString() }).eq('id', id)
    if (error) { showToast('خطا در تأیید پرداخت: ' + error.message, 'error'); return }
    load()
    showToast('پرداخت تأیید شد.')
  }
  const markCompleted = async (id: string, issueCertificate: boolean) => {
    const { error } = await supabase.from('enrollments').update({ completed: true, certificate_issued: issueCertificate }).eq('id', id)
    if (error) { showToast('خطا در ثبت تکمیل دوره: ' + error.message, 'error'); return }
    load()
    showToast('دوره تکمیل شد.')
  }
  const uploadDoc = async () => {
    if (!uploadFor || !docTitle || !docFile) { showToast('عنوان و فایل رو انتخاب کن', 'error'); return }
    setBusy(true)
    const path = `${uploadFor.user_id}/${Date.now()}_${docFile.name}`
    const { error } = await supabase.storage.from('student-documents').upload(path, docFile)
    if (!error) {
      const { error: dbErr } = await supabase.from('student_documents').insert({ user_id: uploadFor.user_id, title: docTitle, file_path: path })
      if (dbErr) { showToast('خطا در ثبت مدرک: ' + dbErr.message, 'error') } else {
        setUploadFor(null); setDocTitle(''); setDocFile(null)
        showToast('مدرک برای دانشجو ارسال شد.')
      }
    } else { showToast('خطا در آپلود: ' + error.message, 'error') }
    setBusy(false)
  }
  if (uploadFor) {
    return (
      <div className="dash-card space-y-3">
        <div className="text-sm font-bold">آپلود مدرک برای {uploadFor.profiles?.name}</div>
        <input className="input-3d" placeholder="عنوان مدرک (مثلاً: گواهی پایان دوره)" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} />
        <input type="file" accept="image/*,.pdf" onChange={(e) => setDocFile(e.target.files?.[0] || null)} className="input-3d" />
        <div className="flex gap-2">
          <button onClick={uploadDoc} disabled={busy} className="hero-primary-btn flex-1 justify-center">{busy ? 'در حال آپلود...' : 'ارسال به دانشجو'}</button>
          <button onClick={() => setUploadFor(null)} className="dash-btn-mini dash-btn-ghost !px-4">انصراف</button>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {enrollments.map((e) => (
        <div key={e.id} className="dash-card">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-sm">{e.profiles?.name}</div>
              <div className="text-xs text-[#7B7FB5]">{e.courses?.title} · {e.class_mode === 'in_person' ? 'حضوری' : 'آنلاین'}</div>
            </div>
            <span className={`dash-badge shrink-0 ${e.payment_status === 'paid' ? 'dash-badge-success' : 'dash-badge-pending'}`}>{e.payment_status === 'paid' ? 'پرداخت‌شده' : 'در انتظار'}</span>
          </div>
          <div className="flex gap-2 mt-3 text-xs flex-wrap">
            {e.payment_status !== 'paid' && <button onClick={() => confirmPayment(e.id)} className="dash-btn-mini dash-btn-gold">تأیید پرداخت</button>}
            {!e.completed && <button onClick={() => markCompleted(e.id, true)} className="dash-btn-mini dash-btn-violet">تکمیل دوره + صدور گواهی</button>}
            <button onClick={() => setUploadFor(e)} className="dash-btn-mini dash-btn-ghost">آپلود مدرک برای این دانشجو</button>
          </div>
        </div>
      ))}
      </div>
      {enrollments.length === 0 && <div className="dash-empty">هنوز ثبت‌نامی وجود ندارد.</div>}
    </div>
  )
}

function TestimonialsTab() {
  const { showToast } = useToast()
  const [items, setItems] = useState<Testimonial[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const load = () => supabase.from('testimonials').select('*').order('created_at', { ascending: false }).then(({ data }) => setItems(data || []))
  useEffect(() => { load() }, [])
  const add = async () => {
    if (!name || !text) return
    const { error } = await supabase.from('testimonials').insert({ student_name: name, text, approved: true, status: 'approved' })
    if (error) { showToast('خطا در افزودن نظر: ' + error.message, 'error'); return }
    setName(''); setText(''); load()
  }
  const setStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    const { error } = await supabase.from('testimonials').update({ status, approved: status === 'approved' }).eq('id', id)
    if (error) { showToast('خطا در ذخیره: ' + error.message, 'error'); return }
    load()
  }
  const remove = async (id: string) => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id)
    if (error) { showToast('خطا در حذف: ' + error.message, 'error'); return }
    load()
  }
  const statusLabel = (s?: string) => (s === 'approved' ? 'تأیید شده' : s === 'rejected' ? 'رد شده' : 'در انتظار بررسی')
  const statusClass = (s?: string) => (s === 'approved' ? 'dash-badge-success' : s === 'rejected' ? 'dash-badge-danger' : 'dash-badge-pending')
  return (
    <div className="space-y-3">
      <div className="dash-card space-y-2">
        <input className="input-3d" placeholder="نام دانشجو" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className="input-3d resize-none" rows={2} placeholder="متن نظر" value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={add} className="hero-primary-btn w-full justify-center">افزودن نظر</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {items.map((t) => (
        <div key={t.id} className="dash-card">
          <div className="text-sm">{t.text}</div>
          <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-accent font-bold">{t.student_name}</span>
              <span className={`dash-badge ${statusClass(t.status)}`}>{statusLabel(t.status)}</span>
            </div>
            <div className="flex gap-3 text-xs">
              {t.status !== 'approved' && <button onClick={() => setStatus(t.id, 'approved')} className="text-[#34D399] hover:underline transition-colors duration-300">تأیید</button>}
              {t.status !== 'rejected' && <button onClick={() => setStatus(t.id, 'rejected')} className="text-[#FB7185] hover:underline transition-colors duration-300">رد</button>}
              <button onClick={() => remove(t.id)} className="text-[#FB7185] hover:underline transition-colors duration-300">حذف</button>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}
function NewsTab() {
  const { showToast } = useToast()
  const [items, setItems] = useState<NewsItem[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const load = () => supabase.from('news').select('*').order('published_at', { ascending: false }).then(({ data }) => setItems(data || []))
  useEffect(() => { load() }, [])
  const add = async () => {
    if (!title || !content) return
    const { error } = await supabase.from('news').insert({ title, content })
    if (error) { showToast('خطا در انتشار خبر: ' + error.message, 'error'); return }
    setTitle(''); setContent(''); load()
  }
  const remove = async (id: string) => {
    const { error } = await supabase.from('news').delete().eq('id', id)
    if (error) { showToast('خطا در حذف خبر: ' + error.message, 'error'); return }
    load()
  }
  return (
    <div className="space-y-3">
      <div className="dash-card space-y-2">
        <input className="input-3d" placeholder="عنوان خبر" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="input-3d resize-none" rows={3} placeholder="متن خبر" value={content} onChange={(e) => setContent(e.target.value)} />
        <button onClick={add} className="hero-primary-btn w-full justify-center">انتشار خبر</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {items.map((n) => (
        <div key={n.id} className="dash-card">
          <div className="font-bold text-sm">{n.title}</div>
          <p className="text-xs text-[#8B8FC0] mt-1">{n.content}</p>
          <button onClick={() => remove(n.id)} className="text-[#FB7185] text-xs mt-2 hover:underline transition-colors duration-300">حذف</button>
        </div>
      ))}
      </div>
    </div>
  )
}

function FaqTab() {
  const { showToast } = useToast()
  const [items, setItems] = useState<FaqItem[]>([])
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const load = () => supabase.from('faq').select('*').order('sort_order').then(({ data }) => setItems(data || []))
  useEffect(() => { load() }, [])
  const add = async () => {
    if (!q || !a) return
    const { error } = await supabase.from('faq').insert({ question: q, answer: a, sort_order: items.length })
    if (error) { showToast('خطا در افزودن سؤال: ' + error.message, 'error'); return }
    setQ(''); setA(''); load()
  }
  const remove = async (id: string) => {
    const { error } = await supabase.from('faq').delete().eq('id', id)
    if (error) { showToast('خطا در حذف: ' + error.message, 'error'); return }
    load()
  }
  return (
    <div className="space-y-3">
      <div className="dash-card space-y-2">
        <input className="input-3d" placeholder="سؤال" value={q} onChange={(e) => setQ(e.target.value)} />
        <textarea className="input-3d resize-none" rows={2} placeholder="پاسخ" value={a} onChange={(e) => setA(e.target.value)} />
        <button onClick={add} className="hero-primary-btn w-full justify-center">افزودن سؤال</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {items.map((f) => (
        <div key={f.id} className="dash-card">
          <div className="font-bold text-sm">{f.question}</div>
          <p className="text-xs text-[#8B8FC0] mt-1">{f.answer}</p>
          <button onClick={() => remove(f.id)} className="text-[#FB7185] text-xs mt-2 hover:underline transition-colors duration-300">حذف</button>
        </div>
      ))}
      </div>
    </div>
  )
}

function MessagesTab() {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => { supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).then(({ data }) => setItems(data || [])) }, [])
  return (
    <div className="space-y-2.5">
      {items.map((m) => (
        <div key={m.id} className="dash-card">
          <div className="flex justify-between text-sm font-bold"><span>{m.name}</span><span className="text-[#7B7FB5] text-xs">{m.phone}</span></div>
          <p className="text-xs text-[#8B8FC0] mt-1">{m.message}</p>
        </div>
      ))}
      {items.length === 0 && <div className="dash-empty">پیامی وجود ندارد.</div>}
    </div>
  )
}
function AnnouncementTab() {
function AnnouncementTab() {
  const { showToast } = useToast()
  const [text, setText] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [audienceType, setAudienceType] = useState<'all' | 'category' | 'course'>('all')
  const [targetCategory, setTargetCategory] = useState<'زبان' | 'کنکور' | 'فنی'>('زبان')
  const [targetCourseId, setTargetCourseId] = useState('')
  useEffect(() => { supabase.from('courses').select('*').then(({ data }) => setCourses(data || [])) }, [])
  const send = async () => {
    if (!text) return
    if (audienceType === 'course' && !targetCourseId) { showToast('یه دوره انتخاب کن', 'error'); return }
    const { error } = await supabase.from('announcements').insert({
      text,
      audience_type: audienceType,
      target_category: audienceType === 'category' ? targetCategory : null,
      course_id: audienceType === 'course' ? targetCourseId : null,
    })
    if (error) { showToast('خطا در ارسال اطلاعیه: ' + error.message, 'error'); return }
    setText(''); setAudienceType('all')
    showToast('اطلاعیه ارسال شد.')
  }
  return (
    <div className="dash-card space-y-2">
      <textarea className="input-3d resize-none" rows={3} placeholder="متن اطلاعیه" value={text} onChange={(e) => setText(e.target.value)} />
      <div>
        <label className="auth-label">مخاطب اطلاعیه</label>
        <select className="input-3d" value={audienceType} onChange={(e) => setAudienceType(e.target.value as any)}>
          <option value="all">همه دانشجویان</option>
          <option value="category">دسته آموزشی خاص</option>
          <option value="course">دوره خاص</option>
        </select>
      </div>
      {audienceType === 'category' && (
        <select className="input-3d" value={targetCategory} onChange={(e) => setTargetCategory(e.target.value as any)}>
          <option>زبان</option><option>کنکور</option><option>فنی</option>
        </select>
      )}
      {audienceType === 'course' && (
        <select className="input-3d" value={targetCourseId} onChange={(e) => setTargetCourseId(e.target.value)}>
          <option value="">انتخاب دوره</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      )}
      <button onClick={send} className="hero-primary-btn w-full justify-center">ارسال اطلاعیه</button>
    </div>
  )
        }

function DocumentsTab() {
  const { showToast } = useToast()
  const [items, setItems] = useState<AcademyDocument[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('مدارک ثبت‌نام')
  const [audienceType, setAudienceType] = useState<'all' | 'category' | 'course'>('all')
  const [targetCategory, setTargetCategory] = useState<'زبان' | 'کنکور' | 'فنی'>('زبان')
  const [targetCourseId, setTargetCourseId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const load = () => {
    supabase.from('academy_documents').select('*').order('uploaded_at', { ascending: false }).then(({ data }) => setItems(data || []))
    supabase.from('courses').select('*').then(({ data }) => setCourses(data || []))
  }
  useEffect(() => { load() }, [])
  const upload = async () => {
    if (!title || !file) { showToast('عنوان و فایل رو انتخاب کن', 'error'); return }
    if (audienceType === 'course' && !targetCourseId) { showToast('یه دوره انتخاب کن', 'error'); return }
    setBusy(true)
    const path = `${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('documents').upload(path, file)
    if (!error) {
      const { error: dbErr } = await supabase.from('academy_documents').insert({
        title, description: description || null, category, audience_type: audienceType,
        target_category: audienceType === 'category' ? targetCategory : null,
        target_course_id: audienceType === 'course' ? targetCourseId : null,
        file_path: path, is_active: true,
      })
      if (dbErr) { showToast('خطا در ثبت مدرک: ' + dbErr.message, 'error') } else {
        setTitle(''); setDescription(''); setFile(null); setAudienceType('all'); load()
        showToast('مدرک آپلود شد.')
      }
    } else { showToast('خطا در آپلود: ' + error.message, 'error') }
    setBusy(false)
  }
  const toggleActive = async (doc: AcademyDocument) => {
    const { error } = await supabase.from('academy_documents').update({ is_active: !doc.is_active }).eq('id', doc.id)
    if (error) { showToast('خطا در تغییر وضعیت: ' + error.message, 'error'); return }
    load()
  }
  const remove = async (doc: AcademyDocument) => {
    const { error: storageErr } = await supabase.storage.from('documents').remove([doc.file_path])
    if (storageErr) { showToast('خطا در حذف فایل: ' + storageErr.message, 'error'); return }
    const { error } = await supabase.from('academy_documents').delete().eq('id', doc.id)
    if (error) { showToast('خطا در حذف مدرک: ' + error.message, 'error'); return }
    load()
  }
  const getUrl = (path: string) => supabase.storage.from('documents').getPublicUrl(path).data.publicUrl
  const audienceLabel = (d: AcademyDocument) => {
    if (d.audience_type === 'course') return 'دوره: ' + (courses.find((c) => c.id === d.target_course_id)?.title || '—')
    if (d.audience_type === 'category') return 'دسته: ' + d.target_category
    return 'همه دانشجویان'
  }
  return (
    <div className="space-y-3">
      <div className="dash-card space-y-2">
        <input className="input-3d" placeholder="عنوان مدرک" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="input-3d resize-none" rows={2} placeholder="توضیحات (اختیاری)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="input-3d" placeholder="دسته‌بندی (مثلاً: مدارک ثبت‌نام، جزوات، فرم‌ها)" value={category} onChange={(e) => setCategory(e.target.value)} />
        <div>
          <label className="auth-label">مخاطب فایل</label>
          <select className="input-3d" value={audienceType} onChange={(e) => setAudienceType(e.target.value as any)}>
            <option value="all">همه دانشجویان</option>
            <option value="category">دسته آموزشی خاص</option>
            <option value="course">دوره خاص</option>
          </select>
        </div>
        {audienceType === 'category' && (
          <select className="input-3d" value={targetCategory} onChange={(e) => setTargetCategory(e.target.value as any)}>
            <option>زبان</option><option>کنکور</option><option>فنی</option>
          </select>
        )}
        {audienceType === 'course' && (
          <select className="input-3d" value={targetCourseId} onChange={(e) => setTargetCourseId(e.target.value)}>
            <option value="">انتخاب دوره</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        )}
        <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input-3d" />
        <button onClick={upload} disabled={busy} className="hero-primary-btn w-full justify-center">{busy ? 'در حال آپلود...' : 'آپلود مدرک'}</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {items.map((d) => (
          <div key={d.id} className="dash-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <a href={getUrl(d.file_path)} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline transition-colors duration-300 font-bold truncate block">{d.title}</a>
                {d.description && <p className="text-xs text-[#8B8FC0] mt-1">{d.description}</p>}
                <div className="text-[10px] text-[#7B7FB5] mt-1.5">{d.category} · {audienceLabel(d)}</div>
              </div>
              <span className={`dash-badge shrink-0 ${d.is_active ? 'dash-badge-success' : 'dash-badge-pending'}`}>{d.is_active ? 'فعال' : 'غیرفعال'}</span>
            </div>
            <div className="flex gap-3 text-xs mt-2.5">
              <button onClick={() => toggleActive(d)} className="text-[#A8ACD9] hover:underline transition-colors duration-300">{d.is_active ? 'غیرفعال کن' : 'فعال کن'}</button>
              <button onClick={() => remove(d)} className="text-[#FB7185] hover:underline transition-colors duration-300">حذف</button>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <div className="dash-empty">هنوز مدرکی آپلود نشده.</div>}
    </div>
  )
}

function TeachersTab() {
  const { showToast } = useToast()
  const [teachers, setTeachers] = useState<Profile[]>([])
  const [email, setEmail] = useState('')
  const load = () => supabase.from('profiles').select('*').eq('role', 'teacher').then(({ data }) => setTeachers(data || []))
  useEffect(() => { load() }, [])
  const addTeacher = async () => {
    if (!email) return
    const { data, error } = await supabase.from('profiles').update({ role: 'teacher' }).eq('email', email).select()
    if (error || !data || data.length === 0) { showToast('کاربری با این ایمیل پیدا نشد.', 'error'); return }
    setEmail(''); load()
    showToast('مدرس اضافه شد.')
  }
  const removeTeacher = async (id: string) => {
    const { error } = await supabase.from('profiles').update({ role: 'student' }).eq('id', id)
    if (error) { showToast('خطا در حذف نقش: ' + error.message, 'error'); return }
    load()
  }
  return (
    <div className="space-y-3">
      <div className="dash-card space-y-2">
        <label className="auth-label">ایمیل کاربری که می‌خوای مدرس بشه</label>
        <input className="input-3d" placeholder="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={addTeacher} className="hero-primary-btn w-full justify-center">افزودن به‌عنوان مدرس</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {teachers.map((t) => (
        <div key={t.id} className="dash-card flex items-center justify-between">
          <div>
            <div className="font-bold text-sm">{t.name}</div>
            <div className="text-xs text-[#7B7FB5]">{t.email}</div>
          </div>
          <button onClick={() => removeTeacher(t.id)} className="text-[#FB7185] text-xs hover:underline transition-colors duration-300">حذف نقش مدرس</button>
        </div>
      ))}
      </div>
      {teachers.length === 0 && <div className="dash-empty">هنوز مدرسی ثبت نشده.</div>}
    </div>
  )
}
function MaterialsTab() {
  const { showToast } = useToast()
  const [items, setItems] = useState<CourseMaterial[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [courseId, setCourseId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const load = () => {
    supabase.from('course_materials').select('*, courses(*), profiles(*)').order('uploaded_at', { ascending: false }).then(({ data }) => setItems((data as CourseMaterial[]) || []))
    supabase.from('courses').select('*').then(({ data }) => setCourses(data || []))
  }
  useEffect(() => { load() }, [])
  const upload = async () => {
    if (!courseId || !file) { showToast('دوره و فایل رو انتخاب کن', 'error'); return }
    setBusy(true)
    const { data: userData } = await supabase.auth.getUser()
    const path = `${courseId}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('materials').upload(path, file)
    if (!error && userData.user) {
      const { error: dbErr } = await supabase.from('course_materials').insert({ course_id: courseId, teacher_id: userData.user.id, file_name: file.name, file_path: path })
      if (dbErr) { showToast('خطا در ثبت جزوه: ' + dbErr.message, 'error') } else {
        setFile(null); load()
        showToast('جزوه آپلود شد.')
      }
    } else if (error) { showToast('خطا در آپلود: ' + error.message, 'error') }
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {items.map((m) => (
        <div key={m.id} className="dash-card flex items-center justify-between">
          <button onClick={() => openFile(m.file_path)} className="text-right flex-1 truncate hover:text-accent transition-colors duration-300">
            <div className="text-sm font-medium truncate">{m.file_name}</div>
            <div className="text-xs text-[#7B7FB5]">{m.courses?.title} · {m.profiles?.name}</div>
          </button>
          <button onClick={() => remove(m)} className="dash-btn-mini dash-btn-danger">حذف</button>
        </div>
      ))}
      </div>
      {items.length === 0 && <div className="dash-empty">هنوز جزوه‌ای آپلود نشده.</div>}
    </div>
  )
}

function SettingsTab() {
  const { showToast } = useToast()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [logoBusy, setLogoBusy] = useState(false)
  const uploadLogo = async (file: File) => {
    setLogoBusy(true)
    const path = `logo/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('documents').upload(path, file)
    if (!error) {
      const url = supabase.storage.from('documents').getPublicUrl(path).data.publicUrl
      const { data, error: dbErr } = await supabase.from('site_settings').update({ value: url }).eq('key', 'logo_url').select()
      if (dbErr) { showToast('خطا در ذخیره لوگو: ' + dbErr.message, 'error') }
      else if (!data || data.length === 0) { showToast('ردیف logo_url در دیتابیس وجود نداره — باید یک‌بار دستی از Supabase ساخته بشه.', 'error') }
      else { setSettings((s) => ({ ...s, logo_url: url })); showToast('لوگو به‌روزرسانی شد.') }
    } else { showToast('خطا در آپلود لوگو: ' + error.message, 'error') }
    setLogoBusy(false)
  }
  useEffect(() => { supabase.from('site_settings').select('key,value').then(({ data }) => { if (data) setSettings(Object.fromEntries(data.map((d) => [d.key, d.value]))) }) }, [])
  const save = async () => {
    const results = await Promise.all(Object.entries(settings).map(([key, value]) => supabase.from('site_settings').update({ value }).eq('key', key)))
    const firstError = results.find((r) => r.error)?.error
    if (firstError) { showToast('خطا در ذخیره: ' + firstError.message, 'error') } else { showToast('تنظیمات ذخیره شد.') }
  }
  const fields: [string, string][] = [
    ['site_name', 'اسم سایت'], ['tagline', 'شعار'], ['hero_title', 'تیتر اصلی صفحه اول'], ['hero_subtitle', 'زیرتیتر صفحه اول'],
    ['phone', 'شماره تماس'], ['address', 'آدرس'], ['instagram', 'اینستاگرام'], ['telegram', 'تلگرام'],
    ['copyright_text', 'متن کپی‌رایت (پایین سایت)'],
    ['stat_students', 'تعداد دانشجوی فعال (مثلاً +۳۰۰۰)'], ['stat_courses', 'تعداد دوره آموزشی (مثلاً +۵۰ — خالی بگذارید برای محاسبه خودکار)'],
    ['stat_satisfaction', 'درصد رضایت دانشجویان (مثلاً ۹۵٪)'], ['stat_years', 'سال سابقه فعالیت (مثلاً +۸)'],
  ]
  return (
    <div className="dash-card space-y-4">
      <div>
        <label className="auth-label">لوگوی آموزشگاه</label>
        {settings.logo_url && <img src={settings.logo_url} alt="لوگو" className="h-16 mb-2 rounded-btn" />}
        <input type="file" accept="image/*" disabled={logoBusy} onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} className="input-3d" />
      </div>
      {fields.map(([key, label]) => (
        <div key={key}>
          <label className="auth-label">{label}</label>
          <input className="input-3d" value={settings[key] || ''} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
        </div>
      ))}
      <button onClick={save} className="hero-primary-btn w-full justify-center">ذخیره تنظیمات</button>
    </div>
  )
}
function AdminSupportTab() {
  const { session } = useAuth()
  const { showToast } = useToast()
  const [students, setStudents] = useState<Profile[]>([])
  const [selected, setSelected] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  useEffect(() => { supabase.from('profiles').select('*').neq('role', 'admin').then(({ data }) => setStudents(data || [])) }, [])
  const load = (userId: string) => { supabase.from('support_messages').select('*').eq('user_id', userId).order('created_at').then(({ data }) => setMessages(data || [])) }
  const send = async () => {
    if (!text.trim() || !session || !selected) return
    const { error } = await supabase.from('support_messages').insert({ user_id: selected.id, sender_id: session.user.id, message: text.trim() })
    if (error) { showToast('خطا در ارسال پیام: ' + error.message, 'error'); return }
    setText(''); load(selected.id)
  }
  if (selected) {
    return (
      <div className="chat-panel">
        <button onClick={() => setSelected(null)} className="text-xs text-accent mb-3 hover:-translate-x-0.5 transition-transform duration-300 inline-block">← برگشت</button>
        <div className="font-bold text-sm mb-3">{selected.name}</div>
        <div className="chat-scroll">
          {messages.map((m) => (
            <div key={m.id} className={`chat-bubble ${m.sender_id === session?.user.id ? 'chat-bubble-mine' : 'chat-bubble-theirs'}`}>{m.message}</div>
          ))}
          {messages.length === 0 && <div className="dash-empty">هنوز پیامی نیست.</div>}
        </div>
        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} className="input-3d flex-1" placeholder="پاسخ..." onKeyDown={(e) => e.key === 'Enter' && send()} />
          <button onClick={send} className="hero-primary-btn !px-4">ارسال</button>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-2.5">
      {students.map((s) => (
        <button key={s.id} onClick={() => { setSelected(s); load(s.id) }} className="dash-card w-full text-right flex items-center justify-between">
          <div>
            <div className="font-bold text-sm">{s.name}</div>
            <div className="text-xs text-[#7B7FB5]">{s.role === 'teacher' ? 'مدرس' : 'دانشجو'}</div>
          </div>
          <span className="text-accent text-xs">گفتگو ←</span>
        </button>
      ))}
    </div>
    )
  }
