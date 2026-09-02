import { useEffect, useState } from 'react'
import { supabase, Course, Enrollment, Testimonial, NewsItem, FaqItem, AcademyDocument, Profile, CourseMaterial } from '../../lib/supabase'

const TABS = ['دوره‌ها', 'دانشجویان', 'مدرسین', 'جزوات دوره', 'نظرات', 'اخبار', 'FAQ', 'پیام‌ها', 'اطلاعیه', 'مدارک آموزشگاه', 'تنظیمات'] as const

export default function AdminDashboard() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('دوره‌ها')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-black mb-4">پنل مدیریت</h1>
      <div className="flex flex-wrap gap-1 bg-bgsoft p-1 rounded-xl border border-white/5 mb-5 text-xs">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2.5 rounded-lg font-medium transition-colors ${tab === t ? 'bg-accent text-bg' : 'text-[#A8ACD9]'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'دوره‌ها' && <CoursesTab />}
      {tab === 'دانشجویان' && <StudentsTab />}
      {tab === 'مدرسین' && <TeachersTab />}
      {tab === 'جزوات دوره' && <MaterialsTab />}
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
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Profile[]>([])
  const [editing, setEditing] = useState<Partial<Course> | null>(null)

  const load = () => {
    supabase.from('courses').select('*, profiles(*)').order('created_at').then(({ data }) => setCourses((data as Course[]) || []))
    supabase.from('profiles').select('*').eq('role', 'teacher').then(({ data }) => setTeachers(data || []))
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing) return
    const payload: any = { ...editing }
    delete payload.id
    delete payload.profiles
    if (editing.id) await supabase.from('courses').update(payload).eq('id', editing.id)
    else await supabase.from('courses').insert(payload)
    setEditing(null)
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('حذف شود؟')) return
    await supabase.from('courses').delete().eq('id', id)
    load()
  }

  if (editing) {
    return (
      <div className="card space-y-3">
        <input className="input" placeholder="عنوان دوره" value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <select className="input" value={editing.category || 'زبان'} onChange={(e) => setEditing({ ...editing, category: e.target.value as any })}>
            <option>زبان</option><option>کنکور</option><option>فنی</option>
          </select>
          <select className="input" value={editing.mode || 'both'} onChange={(e) => setEditing({ ...editing, mode: e.target.value as any })}>
            <option value="both">حضوری و آنلاین</option><option value="in_person">فقط حضوری</option><option value="online">فقط آنلاین</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#7B7FB5] mb-1">مدرس دوره</label>
          <select className="input" value={editing.teacher_id || ''} onChange={(e) => setEditing({ ...editing, teacher_id: e.target.value || null })}>
            <option value="">بدون مدرس مشخص</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <textarea className="input resize-none" rows={3} placeholder="توضیحات دوره" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
        <textarea className="input resize-none" rows={2} placeholder="توضیح کارگاه عملی (اختیاری)" value={editing.workshop_details || ''} onChange={(e) => setEditing({ ...editing, workshop_details: e.target.value })} />
        <textarea className="input resize-none" rows={2} placeholder="مدارک موردنیاز" value={editing.required_documents || ''} onChange={(e) => setEditing({ ...editing, required_documents: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <input className="input" type="number" placeholder="قیمت (تومان)" value={editing.price || ''} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
          <input className="input" placeholder="مدت دوره" value={editing.duration || ''} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} />
        </div>
        <input className="input" placeholder="زمان‌بندی کلاس‌ها" value={editing.schedule || ''} onChange={(e) => setEditing({ ...editing, schedule: e.target.value })} />
        <input className="input" placeholder="پیش‌نیاز (اختیاری)" value={editing.prerequisite || ''} onChange={(e) => setEditing({ ...editing, prerequisite: e.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
          نمایش در سایت (فعال)
        </label>
        <div className="flex gap-2">
          <button onClick={save} className="btn-primary flex-1">ذخیره</button>
          <button onClick={() => setEditing(null)} className="bg-white/5 rounded-xl px-4">انصراف</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button onClick={() => setEditing({ mode: 'both', category: 'زبان', is_active: true })} className="btn-primary w-full mb-2">+ افزودن دوره جدید</button>
      {courses.map((c) => (
        <div key={c.id} className="card !py-3 flex items-center justify-between">
          <div>
            <div className="font-bold text-sm">{c.title} {!c.is_active && <span className="text-[10px] text-[#FB7185]">(غیرفعال)</span>}</div>
            <div className="text-xs text-[#7B7FB5]">{c.category} · {c.price.toLocaleString('fa-IR')} تومان {c.profiles && `· مدرس: ${c.profiles.name}`}</div>
          </div>
          <div className="flex gap-2 text-xs">
            <button onClick={() => setEditing(c)} className="text-accent">ویرایش</button>
            <button onClick={() => remove(c.id)} className="text-[#FB7185]">حذف</button>
          </div>
        </div>
      ))}
    </div>
  )
    }
function StudentsTab() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])

  const load = () =>
    supabase.from('enrollments').select('*, courses(*), profiles(*)').order('enrolled_at', { ascending: false }).then(({ data }) => setEnrollments((data as Enrollment[]) || []))
  useEffect(() => { load() }, [])

  const confirmPayment = async (id: string) => {
    await supabase.from('enrollments').update({ payment_status: 'paid', confirmed_at: new Date().toISOString() }).eq('id', id)
    load()
  }
  const markCompleted = async (id: string, issueCertificate: boolean) => {
    await supabase.from('enrollments').update({ completed: true, certificate_issued: issueCertificate }).eq('id', id)
    load()
  }

  return (
    <div className="space-y-2">
      {enrollments.map((e) => (
        <div key={e.id} className="card !py-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-sm">{e.profiles?.name}</div>
              <div className="text-xs text-[#7B7FB5]">{e.courses?.title} · {e.class_mode === 'in_person' ? 'حضوری' : 'آنلاین'}</div>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 ${e.payment_status === 'paid' ? 'bg-[#34D399]/15 text-[#34D399]' : 'bg-accent/15 text-accent'}`}>
              {e.payment_status === 'paid' ? 'پرداخت‌شده' : 'در انتظار'}
            </span>
          </div>
          <div className="flex gap-2 mt-2 text-xs">
            {e.payment_status !== 'paid' && (
              <button onClick={() => confirmPayment(e.id)} className="bg-accent text-bg font-bold px-3 py-1.5 rounded-lg">تأیید پرداخت</button>
            )}
            {!e.completed && (
              <button onClick={() => markCompleted(e.id, true)} className="bg-violet/20 text-[#D8D7FF] px-3 py-1.5 rounded-lg">تکمیل دوره + صدور گواهی</button>
            )}
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
      <div className="card space-y-2">
        <input className="input" placeholder="نام دانشجو" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className="input resize-none" rows={2} placeholder="متن نظر" value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={add} className="btn-primary w-full">افزودن نظر</button>
      </div>
      {items.map((t) => (
        <div key={t.id} className="card !py-3">
          <div className="text-sm">{t.text}</div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-accent font-bold">{t.student_name}</span>
            <div className="flex gap-2 text-xs">
              <button onClick={() => toggle(t.id, t.approved)} className={t.approved ? 'text-[#34D399]' : 'text-[#7B7FB5]'}>{t.approved ? 'نمایش‌داده‌شده' : 'مخفی'}</button>
              <button onClick={() => remove(t.id)} className="text-[#FB7185]">حذف</button>
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
      <div className="card space-y-2">
        <input className="input" placeholder="عنوان خبر" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="input resize-none" rows={3} placeholder="متن خبر" value={content} onChange={(e) => setContent(e.target.value)} />
        <button onClick={add} className="btn-primary w-full">انتشار خبر</button>
      </div>
      {items.map((n) => (
        <div key={n.id} className="card !py-3">
          <div className="font-bold text-sm">{n.title}</div>
          <p className="text-xs text-[#8B8FC0] mt-1">{n.content}</p>
          <button onClick={() => remove(n.id)} className="text-[#FB7185] text-xs mt-2">حذف</button>
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
      <div className="card space-y-2">
        <input className="input" placeholder="سؤال" value={q} onChange={(e) => setQ(e.target.value)} />
        <textarea className="input resize-none" rows={2} placeholder="پاسخ" value={a} onChange={(e) => setA(e.target.value)} />
        <button onClick={add} className="btn-primary w-full">افزودن سؤال</button>
      </div>
      {items.map((f) => (
        <div key={f.id} className="card !py-3">
          <div className="font-bold text-sm">{f.question}</div>
          <p className="text-xs text-[#8B8FC0] mt-1">{f.answer}</p>
          <button onClick={() => remove(f.id)} className="text-[#FB7185] text-xs mt-2">حذف</button>
        </div>
      ))}
    </div>
  )
}

function MessagesTab() {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => { supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).then(({ data }) => setItems(data || [])) }, [])
  return (
    <div className="space-y-2">
      {items.map((m) => (
        <div key={m.id} className="card !py-3">
          <div className="flex justify-between text-sm font-bold"><span>{m.name}</span><span className="text-[#7B7FB5] text-xs">{m.phone}</span></div>
          <p className="text-xs text-[#8B8FC0] mt-1">{m.message}</p>
        </div>
      ))}
      {items.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">پیامی وجود ندارد.</div>}
    </div>
  )
}
function AnnouncementTab() {
  const [text, setText] = useState('')
  const send = async () => {
    if (!text) return
    await supabase.from('announcements').insert({ text })
    setText('')
    alert('اطلاعیه ارسال شد.')
  }
  return (
    <div className="card space-y-2">
      <textarea className="input resize-none" rows={3} placeholder="متن اطلاعیه برای همه دانشجویان" value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={send} className="btn-primary w-full">ارسال اطلاعیه</button>
    </div>
  )
}

function DocumentsTab() {
  const [items, setItems] = useState<AcademyDocument[]>([])
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const load = () => supabase.from('academy_documents').select('*').order('uploaded_at', { ascending: false }).then(({ data }) => setItems(data || []))
  useEffect(() => { load() }, [])
  const upload = async () => {
    if (!title || !file) { alert('عنوان و فایل رو انتخاب کن'); return }
    setBusy(true)
    const path = `${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('documents').upload(path, file)
    if (!error) {
      await supabase.from('academy_documents').insert({ title, file_path: path })
      setTitle(''); setFile(null); load()
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
      <div className="card space-y-2">
        <input className="input" placeholder="عنوان مدرک" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input" />
        <button onClick={upload} disabled={busy} className="btn-primary w-full">{busy ? 'در حال آپلود...' : 'آپلود مدرک'}</button>
      </div>
      {items.map((d) => (
        <div key={d.id} className="card !py-3 flex items-center justify-between">
          <a href={getUrl(d.file_path)} target="_blank" rel="noreferrer" className="text-sm text-accent">{d.title}</a>
          <button onClick={() => remove(d)} className="text-[#FB7185] text-xs">حذف</button>
        </div>
      ))}
      {items.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز مدرکی آپلود نشده.</div>}
    </div>
  )
}

function TeachersTab() {
  const [teachers, setTeachers] = useState<Profile[]>([])
  const [email, setEmail] = useState('')
  const load = () => supabase.from('profiles').select('*').eq('role', 'teacher').then(({ data }) => setTeachers(data || []))
  useEffect(() => { load() }, [])
  const addTeacher = async () => {
    if (!email) return
    const { data, error } = await supabase.from('profiles').update({ role: 'teacher' }).eq('email', email).select()
    if (error || !data || data.length === 0) { alert('کاربری با این ایمیل پیدا نشد. اول باید تو سایت ثبت‌نام کرده باشد.'); return }
    setEmail('')
    load()
  }
  const removeTeacher = async (id: string) => {
    await supabase.from('profiles').update({ role: 'student' }).eq('id', id)
    load()
  }
  return (
    <div className="space-y-3">
      <div className="card space-y-2">
        <label className="block text-xs text-[#7B7FB5]">ایمیل کاربری که می‌خوای مدرس بشه (باید قبلاً تو سایت ثبت‌نام کرده باشد)</label>
        <input className="input" placeholder="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={addTeacher} className="btn-primary w-full">افزودن به‌عنوان مدرس</button>
      </div>
      {teachers.map((t) => (
        <div key={t.id} className="card !py-3 flex items-center justify-between">
          <div>
            <div className="font-bold text-sm">{t.name}</div>
            <div className="text-xs text-[#7B7FB5]">{t.email}</div>
          </div>
          <button onClick={() => removeTeacher(t.id)} className="text-[#FB7185] text-xs">حذف نقش مدرس</button>
        </div>
      ))}
      {teachers.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز مدرسی ثبت نشده.</div>}
    </div>
  )
      }
function MaterialsTab() {
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
    if (!courseId || !file) { alert('دوره و فایل رو انتخاب کن'); return }
    setBusy(true)
    const { data: userData } = await supabase.auth.getUser()
    const path = `${courseId}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('materials').upload(path, file)
    if (!error && userData.user) {
      await supabase.from('course_materials').insert({
        course_id: courseId,
        teacher_id: userData.user.id,
        file_name: file.name,
        file_path: path,
      })
      setFile(null); load()
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
      <div className="card space-y-2">
        <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">انتخاب دوره</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input" />
        <button onClick={upload} disabled={busy} className="btn-primary w-full">{busy ? 'در حال آپلود...' : 'آپلود جزوه'}</button>
      </div>
      {items.map((m) => (
        <div key={m.id} className="card !py-3 flex items-center justify-between">
          <button onClick={() => openFile(m.file_path)} className="text-right flex-1 truncate">
            <div className="text-sm font-medium truncate">{m.file_name}</div>
            <div className="text-xs text-[#7B7FB5]">{m.courses?.title} · {m.profiles?.name}</div>
          </button>
          <button onClick={() => remove(m)} className="text-[#FB7185] text-xs px-2">حذف</button>
        </div>
      ))}
      {items.length === 0 && <div className="text-center py-10 text-[#5C5F8A]">هنوز جزوه‌ای آپلود نشده.</div>}
    </div>
  )
}

function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  useEffect(() => { supabase.from('site_settings').select('key,value').then(({ data }) => { if (data) setSettings(Object.fromEntries(data.map((d) => [d.key, d.value]))) }) }, [])
  const save = async () => {
    const updates = Object.entries(settings).map(([key, value]) => supabase.from('site_settings').update({ value }).eq('key', key))
    await Promise.all(updates)
    alert('تنظیمات ذخیره شد.')
  }
  const fields: [string, string][] = [
    ['site_name', 'اسم سایت'], ['tagline', 'شعار'], ['hero_title', 'تیتر اصلی صفحه اول'], ['hero_subtitle', 'زیرتیتر صفحه اول'],
    ['phone', 'شماره تماس'], ['address', 'آدرس'], ['instagram', 'اینستاگرام'], ['telegram', 'تلگرام'],
  ]
  return (
    <div className="card space-y-3">
      {fields.map(([key, label]) => (
        <div key={key}>
          <label className="block text-xs text-[#7B7FB5] mb-1">{label}</label>
          <input className="input" value={settings[key] || ''} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
        </div>
      ))}
      <button onClick={save} className="btn-primary w-full">ذخیره تنظیمات</button>
    </div>
  )
      }
