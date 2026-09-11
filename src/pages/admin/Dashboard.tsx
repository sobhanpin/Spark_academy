import { useEffect, useState } from 'react'
import { supabase, Course, Enrollment, Testimonial, NewsItem, FaqItem, AcademyDocument, Profile, CourseMaterial } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
const TABS = ['دوره‌ها', 'دانشجویان', 'مدرسین', 'جزوات دوره', 'پشتیبانی', 'نظرات', 'اخبار', 'FAQ', 'پیام‌ها', 'اطلاعیه', 'مدارک آموزشگاه', 'تنظیمات'] as const

export default function AdminDashboard() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('دوره‌ها')

  return (
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-xl sm:text-2xl font-black mb-5">پنل مدیریت</h1>
      <div className="flex flex-wrap gap-1.5 glass-panel p-1.5 rounded-2xl mb-6 text-xs">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-2.5 rounded-btn font-medium transition-all duration-300 ${
              tab === t ? 'bg-gradient-to-l from-accent to-accent2 text-bg font-bold shadow-glow-gold' : 'text-[#A8ACD9] hover:bg-white/5'
            }`}
          >
            {t}
          </button>
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

const inputCls = 'input rounded-btn shadow-neumo-in focus:shadow-glow-violet transition-shadow duration-300'
const btnCls = 'btn-primary rounded-btn shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform duration-300 disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0'

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
    } else {
      showToast('خطا در آپلود عکس: ' + error.message, 'error')
    }
    setImgBusy(false)
  }

  const save = async () => {
    if (!editing) return
    const payload: any = { ...editing }
    delete payload.id
    delete payload.profiles
    if (editing.id) await supabase.from('courses').update(payload).eq('id', editing.id)
    else await supabase.from('courses').insert(payload)
    setEditing(null)
    load()
    showToast('دوره ذخیره شد.')
  }

  const remove = async (id: string) => {
    if (!confirm('حذف شود؟')) return
    await supabase.from('courses').delete().eq('id', id)
    load()
    showToast('دوره حذف شد.')
  }

  if (editing) {
    return (
      <div className="glass-panel rounded-card p-5 space-y-3">
        <input className={inputCls} placeholder="عنوان دوره" value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
        <div>
          <label className="block text-xs text-[#7B7FB5] mb-1.5">عکس دوره</label>
          {editing.image_url && <img src={editing.image_url} alt="پیش‌نمایش" className="w-full h-32 object-cover rounded-btn mb-2 shadow-neumo-out" />}
          <input type="file" accept="image/*" disabled={imgBusy} onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className={inputCls} />
          {imgBusy && <div className="text-xs text-[#7B7FB5] mt-1">در حال آپلود...</div>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select className={inputCls} value={editing.category || 'زبان'} onChange={(e) => setEditing({ ...editing, category: e.target.value as any })}>
            <option>زبان</option><option>کنکور</option><option>فنی</option>
          </select>
          <select className={inputCls} value={editing.mode || 'both'} onChange={(e) => setEditing({ ...editing, mode: e.target.value as any })}>
            <option value="both">حضوری و آنلاین</option><option value="in_person">فقط حضوری</option><option value="online">فقط آنلاین</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#7B7FB5] mb-1.5">مدرس دوره</label>
          <select className={inputCls} value={editing.teacher_id || ''} onChange={(e) => setEditing({ ...editing, teacher_id: e.target.value || null })}>
            <option value="">بدون مدرس مشخص</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        {editing.mode !== 'in_person' && (
          <input className={inputCls} placeholder="لینک کلاس آنلاین (اسکای‌روم/گوگل‌میت و غیره)" value={editing.online_link || ''} onChange={(e) => setEditing({ ...editing, online_link: e.target.value })} />
        )}
        <textarea className={`${inputCls} resize-none`} rows={3} placeholder="توضیحات دوره" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="توضیح کارگاه عملی (اختیاری)" value={editing.workshop_details || ''} onChange={(e) => setEditing({ ...editing, workshop_details: e.target.value })} />
        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="مدارک موردنیاز" value={editing.required_documents || ''} onChange={(e) => setEditing({ ...editing, required_documents: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <input className={inputCls} type="number" placeholder="قیمت (تومان)" value={editing.price || ''} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
          <input className={inputCls} placeholder="مدت دوره" value={editing.duration || ''} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} />
        </div>
        <input className={inputCls} placeholder="زمان‌بندی کلاس‌ها" value={editing.schedule || ''} onChange={(e) => setEditing({ ...editing, schedule: e.target.value })} />
        <input className={inputCls} placeholder="پیش‌نیاز (اختیاری)" value={editing.prerequisite || ''} onChange={(e) => setEditing({ ...editing, prerequisite: e.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
          نمایش در سایت (فعال)
        </label>
        <div className="flex gap-2">
          <button onClick={save} className={`${btnCls} flex-1`}>ذخیره</button>
          <button onClick={() => setEditing(null)} className="bg-white/5 rounded-btn px-4 shadow-neumo-out hover:-translate-y-0.5 transition-transform duration-300">انصراف</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      <button onClick={() => setEditing({ mode: 'both', category: 'زبان', is_active: true })} className={`${btnCls} w-full mb-2`}>+ افزودن دوره جدید</button>
      {courses.map((c) => (
        <div key={c.id} className="glass-panel rounded-btn p-4 flex items-center justify-between">
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
    await supabase.from('enrollments').update({ payment_status: 'paid', confirmed_at: new Date().toISOString() }).eq('id', id)
    load()
    showToast('پرداخت تأیید شد.')
  }
  const markCompleted = async (id: string, issueCertificate: boolean) => {
    await supabase.from('enrollments').update({ completed: true, certificate_issued: issueCertificate }).eq('id', id)
    load()
    showToast('دوره تکمیل شد.')
  }

  const uploadDoc = async () => {
    if (!uploadFor || !docTitle || !docFile) { showToast('عنوان و فایل رو انتخاب کن', 'error'); return }
    setBusy(true)
    const path = `${uploadFor.user_id}/${Date.now()}_${docFile.name}`
    const { error } = await supabase.storage.from('student-documents').upload(path, docFile)
    if (!error) {
      await supabase.from('student_documents').insert({ user_id: uploadFor.user_id, title: docTitle, file_path: path })
      setUploadFor(null); setDocTitle(''); setDocFile(null)
      showToast('مدرک برای دانشجو ارسال شد.')
    } else {
      showToast('خطا در آپلود: ' + error.message, 'error')
    }
    setBusy(false)
  }

  if (uploadFor) {
    return (
      <div className="glass-panel rounded-card p-5 space-y-3">
        <div className="text-sm font-bold">آپلود مدرک برای {uploadFor.profiles?.name}</div>
        <input className={inputCls} placeholder="عنوان مدرک (مثلاً: گواهی پایان دوره)" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} />
        <input type="file" accept="image/*,.pdf" onChange={(e) => setDocFile(e.target.files?.[0] || null)} className={inputCls} />
        <div className="flex gap-2">
          <button onClick={uploadDoc} disabled={busy} className={`${btnCls} flex-1`}>{busy ? 'در حال آپلود...' : 'ارسال به دانشجو'}</button>
          <button onClick={() => setUploadFor(null)} className="bg-white/5 rounded-btn px-4 shadow-neumo-out hover:-translate-y-0.5 transition-transform duration-300">انصراف</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {enrollments.map((e) => (
        <div key={e.id} className="glass-panel rounded-card p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-sm">{e.profiles?.name}</div>
              <div className="text-xs text-[#7B7FB5]">{e.courses?.title} · {e.class_mode === 'in_person' ? 'حضوری' : 'آنلاین'}</div>
            </div>
            <span className={`text-[11px] px-2.5 py-1 rounded-pill font-bold shrink-0 shadow-neumo-out ${e.payment_status === 'paid' ? 'bg-[#34D399]/15 text-[#34D399]' : 'bg-accent/15 text-accent'}`}>
              {e.payment_status === 'paid' ? 'پرداخت‌شده' : 'در انتظار'}
            </span>
          </div>
          <div className="flex gap-2 mt-3 text-xs flex-wrap">
            {e.payment_status !== 'paid' && (
              <button onClick={() => confirmPayment(e.id)} className="bg-accent text-bg font-bold px-3.5 py-2 rounded-btn shadow-glow-gold hover:-translate-y-0.5 transition-transform duration-300">تأیید پرداخت</button>
            )}
            {!e.completed && (
              <button onClick={() => markCompleted(e.id, true)} className="bg-violet/20 text-[#D8D7FF] px-3.5 py-2 rounded-btn shadow-neumo-out hover:-translate-y-0.5 transition-transform duration-300">تکمیل دوره + صدور گواهی</button>
            )}
            <button onClick={() => setUploadFor(e)} className="bg-white/5 px-3.5 py-2 rounded-btn shadow-neumo-out hover:-translate-y-0.5 transition-transform duration-300">آپلود مدرک برای این دانشجو</button>
          </div>
        </div>
      ))}
      {enrollments.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز ثبت‌نامی وجود ندارد.</div>}
    </div>
  )
}

function TestimonialsTab() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const load = () => supabase.from('testimonials').select('*').order('created_at', { ascending: false }).then(({ data }) => setItems(data || []))
  useEffect(() => { load() }, [])
  const add = async () => {
    if (!name || !text) return
    await supabase.from('testimonials').insert({ student_name: name, text, approved: true })
    setName(''); setText(''); load()
  }
  const toggle = async (id: string, approved: boolean) => { await supabase.from('testimonials').update({ approved: !approved }).eq('id', id); load() }
  const remove = async (id: string) => { await supabase.from('testimonials').delete().eq('id', id); load() }
  return (
    <div className="space-y-3">
      <div className="glass-panel rounded-card p-5 space-y-2">
        <input className={inputCls} placeholder="نام دانشجو" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="متن نظر" value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={add} className={`${btnCls} w-full`}>افزودن نظر</button>
      </div>
      {items.map((t) => (
        <div key={t.id} className="glass-panel rounded-btn p-4">
          <div className="text-sm">{t.text}</div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-accent font-bold">{t.student_name}</span>
            <div className="flex gap-3 text-xs">
              <button onClick={() => toggle(t.id, t.approved)} className={`transition-colors duration-300 ${t.approved ? 'text-[#34D399]' : 'text-[#7B7FB5]'}`}>{t.approved ? 'نمایش‌داده‌شده' : 'مخفی'}</button>
              <button onClick={() => remove(t.id)} className="text-[#FB7185] hover:underline transition-colors duration-300">حذف</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
function NewsTab() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const load = () => supabase.from('news').select('*').order('published_at', { ascending: false }).then(({ data }) => setItems(data || []))
  useEffect(() => { load() }, [])
  const add = async () => {
    if (!title || !content) return
    await supabase.from('news').insert({ title, content })
    setTitle(''); setContent(''); load()
  }
  const remove = async (id: string) => { await supabase.from('news').delete().eq('id', id); load() }
  return (
    <div className="space-y-3">
      <div className="glass-panel rounded-card p-5 space-y-2">
        <input className={inputCls} placeholder="عنوان خبر" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className={`${inputCls} resize-none`} rows={3} placeholder="متن خبر" value={content} onChange={(e) => setContent(e.target.value)} />
        <button onClick={add} className={`${btnCls} w-full`}>انتشار خبر</button>
      </div>
      {items.map((n) => (
        <div key={n.id} className="glass-panel rounded-btn p-4">
          <div className="font-bold text-sm">{n.title}</div>
          <p className="text-xs text-[#8B8FC0] mt-1">{n.content}</p>
          <button onClick={() => remove(n.id)} className="text-[#FB7185] text-xs mt-2 hover:underline transition-colors duration-300">حذف</button>
        </div>
      ))}
    </div>
  )
}

function FaqTab() {
  const [items, setItems] = useState<FaqItem[]>([])
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const load = () => supabase.from('faq').select('*').order('sort_order').then(({ data }) => setItems(data || []))
  useEffect(() => { load() }, [])
  const add = async () => {
    if (!q || !a) return
    await supabase.from('faq').insert({ question: q, answer: a, sort_order: items.length })
    setQ(''); setA(''); load()
  }
  const remove = async (id: string) => { await supabase.from('faq').delete().eq('id', id); load() }
  return (
    <div className="space-y-3">
      <div className="glass-panel rounded-card p-5 space-y-2">
        <input className={inputCls} placeholder="سؤال" value={q} onChange={(e) => setQ(e.target.value)} />
        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="پاسخ" value={a} onChange={(e) => setA(e.target.value)} />
        <button onClick={add} className={`${btnCls} w-full`}>افزودن سؤال</button>
      </div>
      {items.map((f) => (
        <div key={f.id} className="glass-panel rounded-btn p-4">
          <div className="font-bold text-sm">{f.question}</div>
          <p className="text-xs text-[#8B8FC0] mt-1">{f.answer}</p>
          <button onClick={() => remove(f.id)} className="text-[#FB7185] text-xs mt-2 hover:underline transition-colors duration-300">حذف</button>
        </div>
      ))}
    </div>
  )
}

function MessagesTab() {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => { supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).then(({ data }) => setItems(data || [])) }, [])
  return (
    <div className="space-y-2.5">
      {items.map((m) => (
        <div key={m.id} className="glass-panel rounded-btn p-4">
          <div className="flex justify-between text-sm font-bold"><span>{m.name}</span><span className="text-[#7B7FB5] text-xs">{m.phone}</span></div>
          <p className="text-xs text-[#8B8FC0] mt-1">{m.message}</p>
        </div>
      ))}
      {items.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">پیامی وجود ندارد.</div>}
    </div>
  )
}
function AnnouncementTab() {
  const { showToast } = useToast()
  const [text, setText] = useState('')
  const send = async () => {
    if (!text) return
    await supabase.from('announcements').insert({ text })
    setText('')
    showToast('اطلاعیه ارسال شد.')
  }
  return (
    <div className="glass-panel rounded-card p-5 space-y-2">
      <textarea className={`${inputCls} resize-none`} rows={3} placeholder="متن اطلاعیه برای همه دانشجویان" value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={send} className={`${btnCls} w-full`}>ارسال اطلاعیه</button>
    </div>
  )
}

function DocumentsTab() {
  const { showToast } = useToast()
  const [items, setItems] = useState<AcademyDocument[]>([])
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const load = () => supabase.from('academy_documents').select('*').order('uploaded_at', { ascending: false }).then(({ data }) => setItems(data || []))
  useEffect(() => { load() }, [])
  const upload = async () => {
    if (!title || !file) { showToast('عنوان و فایل رو انتخاب کن', 'error'); return }
    setBusy(true)
    const path = `${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('documents').upload(path, file)
    if (!error) {
      await supabase.from('academy_documents').insert({ title, file_path: path })
      setTitle(''); setFile(null); load()
      showToast('مدرک آپلود شد.')
    } else {
      showToast('خطا در آپلود: ' + error.message, 'error')
    }
    setBusy(false)
  }
  const remove = async (doc: AcademyDocument) => {
    await supabase.storage.from('documents').remove([doc.file_path])
    await supabase.from('academy_documents').delete().eq('id', doc.id)
    load()
  }
  const getUrl = (path: string) => supabase.storage.from('documents').getPublicUrl(path).data.publicUrl
  return (
    <div className="space-y-3">
      <div className="glass-panel rounded-card p-5 space-y-2">
        <input className={inputCls} placeholder="عنوان مدرک" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className={inputCls} />
        <button onClick={upload} disabled={busy} className={`${btnCls} w-full`}>{busy ? 'در حال آپلود...' : 'آپلود مدرک'}</button>
      </div>
      {items.map((d) => (
        <div key={d.id} className="glass-panel rounded-btn p-4 flex items-center justify-between">
          <a href={getUrl(d.file_path)} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline transition-colors duration-300">{d.title}</a>
          <button onClick={() => remove(d)} className="text-[#FB7185] text-xs hover:underline transition-colors duration-300">حذف</button>
        </div>
      ))}
      {items.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز مدرکی آپلود نشده.</div>}
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
    await supabase.from('profiles').update({ role: 'student' }).eq('id', id)
    load()
  }
  return (
    <div className="space-y-3">
      <div className="glass-panel rounded-card p-5 space-y-2">
        <label className="block text-xs text-[#7B7FB5]">ایمیل کاربری که می‌خوای مدرس بشه</label>
        <input className={inputCls} placeholder="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={addTeacher} className={`${btnCls} w-full`}>افزودن به‌عنوان مدرس</button>
      </div>
      {teachers.map((t) => (
        <div key={t.id} className="glass-panel rounded-btn p-4 flex items-center justify-between">
          <div>
            <div className="font-bold text-sm">{t.name}</div>
            <div className="text-xs text-[#7B7FB5]">{t.email}</div>
          </div>
          <button onClick={() => removeTeacher(t.id)} className="text-[#FB7185] text-xs hover:underline transition-colors duration-300">حذف نقش مدرس</button>
        </div>
      ))}
      {teachers.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز مدرسی ثبت نشده.</div>}
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
      await supabase.from('course_materials').insert({ course_id: courseId, teacher_id: userData.user.id, file_name: file.name, file_path: path })
      setFile(null); load()
      showToast('جزوه آپلود شد.')
    } else if (error) {
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
            <div className="text-xs text-[#7B7FB5]">{m.courses?.title} · {m.profiles?.name}</div>
          </button>
          <button onClick={() => remove(m)} className="text-[#FB7185] text-xs px-2 hover:underline transition-colors duration-300">حذف</button>
        </div>
      ))}
      {items.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز جزوه‌ای آپلود نشده.</div>}
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
      await supabase.from('site_settings').upsert({ key: 'logo_url', value: url })
      setSettings((s) => ({ ...s, logo_url: url }))
      showToast('لوگو به‌روزرسانی شد.')
    } else {
      showToast('خطا در آپلود لوگو: ' + error.message, 'error')
    }
    setLogoBusy(false)
  }
  useEffect(() => { supabase.from('site_settings').select('key,value').then(({ data }) => { if (data) setSettings(Object.fromEntries(data.map((d) => [d.key, d.value]))) }) }, [])
  const save = async () => {
    const updates = Object.entries(settings).map(([key, value]) => supabase.from('site_settings').update({ value }).eq('key', key))
    await Promise.all(updates)
    showToast('تنظیمات ذخیره شد.')
  }
  const fields: [string, string][] = [
    ['site_name', 'اسم سایت'], ['tagline', 'شعار'], ['hero_title', 'تیتر اصلی صفحه اول'], ['hero_subtitle', 'زیرتیتر صفحه اول'],
    ['phone', 'شماره تماس'], ['address', 'آدرس'], ['instagram', 'اینستاگرام'], ['telegram', 'تلگرام'],
    ['copyright_text', 'متن کپی‌رایت (پایین سایت)'],
  ]
  return (
    <div className="glass-panel rounded-card p-5 space-y-4">
      <div>
        <label className="block text-xs text-[#7B7FB5] mb-1.5">لوگوی آموزشگاه</label>
        {settings.logo_url && <img src={settings.logo_url} alt="لوگو" className="h-16 mb-2 rounded-btn shadow-neumo-out" />}
        <input type="file" accept="image/*" disabled={logoBusy} onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} className={inputCls} />
      </div>
      {fields.map(([key, label]) => (
        <div key={key}>
          <label className="block text-xs text-[#7B7FB5] mb-1.5">{label}</label>
          <input className={inputCls} value={settings[key] || ''} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
        </div>
      ))}
      <button onClick={save} className={`${btnCls} w-full`}>ذخیره تنظیمات</button>
    </div>
  )
}
function AdminSupportTab() {
  const { session } = useAuth()
  const [students, setStudents] = useState<Profile[]>([])
  const [selected, setSelected] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('*').neq('role', 'admin').then(({ data }) => setStudents(data || []))
  }, [])

  const load = (userId: string) => {
    supabase.from('support_messages').select('*').eq('user_id', userId).order('created_at').then(({ data }) => setMessages(data || []))
  }

  const send = async () => {
    if (!text.trim() || !session || !selected) return
    await supabase.from('support_messages').insert({ user_id: selected.id, sender_id: session.user.id, message: text.trim() })
    setText(''); load(selected.id)
  }

  if (selected) {
    return (
      <div className="glass-panel rounded-card p-5">
        <button onClick={() => setSelected(null)} className="text-xs text-accent mb-3 hover:-translate-x-0.5 transition-transform duration-300 inline-block">← برگشت</button>
        <div className="font-bold text-sm mb-3">{selected.name}</div>
        <div className="space-y-2 max-h-80 overflow-y-auto mb-3">
          {messages.map((m) => (
            <div key={m.id} className={`text-sm px-3.5 py-2.5 rounded-btn max-w-[80%] shadow-neumo-out ${m.sender_id === session?.user.id ? 'bg-gradient-to-l from-accent to-accent2 text-bg mr-auto' : 'bg-white/5 text-[#C4C7ED]'}`}>{m.message}</div>
          ))}
          {messages.length === 0 && <div className="text-center text-[#5C5F8A] text-sm py-6">هنوز پیامی نیست.</div>}
        </div>
        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} className={`${inputCls} flex-1`} placeholder="پاسخ..." onKeyDown={(e) => e.key === 'Enter' && send()} />
          <button onClick={send} className={`${btnCls} !px-4`}>ارسال</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {students.map((s) => (
        <button key={s.id} onClick={() => { setSelected(s); load(s.id) }} className="glass-panel rounded-btn p-4 w-full text-right flex items-center justify-between transition-transform duration-300 hover:-translate-y-0.5">
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
