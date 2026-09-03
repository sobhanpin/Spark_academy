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
        {editing.mode !== 'in_person' && (
          <input className="input" placeholder="لینک کلاس آنلاین (اسکای‌روم/گوگل‌میت و غیره)" value={editing.online_link || ''} onChange={(e) => setEditing({ ...editing, online_link: e.target.value })} />
        )}
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
