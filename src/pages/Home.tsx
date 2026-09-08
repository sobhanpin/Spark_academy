import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, Course, Testimonial, NewsItem, FaqItem, AcademyDocument } from '../lib/supabase'

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [documents, setDocuments] = useState<AcademyDocument[]>([])
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('courses').select('*').eq('is_active', true).order('created_at').limit(6).then(({ data }) => setCourses(data || []))
    supabase.from('testimonials').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(6).then(({ data }) => setTestimonials(data || []))
    supabase.from('news').select('*').order('published_at', { ascending: false }).limit(3).then(({ data }) => setNews(data || []))
    supabase.from('faq').select('*').order('sort_order').then(({ data }) => setFaqs(data || []))
    supabase.from('academy_documents').select('*').order('uploaded_at', { ascending: false }).then(({ data }) => setDocuments(data || []))
    supabase.from('site_settings').select('key,value').then(({ data }) => {
      if (data) setSettings(Object.fromEntries(data.map((d) => [d.key, d.value])))
    })
  }, [])

  const docUrl = (path: string) => supabase.storage.from('documents').getPublicUrl(path).data.publicUrl

  return (
    <div>
      <section className="relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-80" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 500">
          <defs>
            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFB84D" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="wave2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#FFB84D" stopOpacity="0.08" />
            </linearGradient>
            <radialGradient id="softGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF7A3D" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FF7A3D" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="170" cy="140" r="240" fill="url(#softGlow)" />
          <path d="M-40 200 Q210 80 400 220 T840 190 V-40 H-40 Z" fill="url(#wave1)" opacity="0.65" />
          <path d="M-40 440 Q230 300 420 420 T840 380 V640 H-40 Z" fill="url(#wave2)" opacity="0.6" />
          <path d="M-40 340 Q250 500 420 340 T840 400" fill="none" stroke="#FFB84D" strokeWidth="1.5" strokeOpacity="0.4" />
        </svg>
        <div className="max-w-5xl mx-auto px-4 py-20 text-center relative animate-fade-up">
          <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-4">
            {settings.hero_title || 'اسپارک باش، مسیرتو روشن کن'}
          </h1>
          <p className="text-[#A8ACD9] max-w-xl mx-auto mb-8">
            {settings.hero_subtitle || 'زبان، کنکور، مهارت‌های فنی — هر مسیری که انتخاب کنی، ما همراهتیم. حضوری یا آنلاین، انتخاب با توئه.'}
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/courses" className="btn-primary">مشاهده دوره‌ها</Link>
            <Link to="/contact" className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl font-bold transition-colors">تماس با ما</Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-black mb-6">دوره‌های ما</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className="card hover:border-accent/40 hover:-translate-y-1 transition-all block"
            >
              <span className="text-xs text-accent font-bold">{c.category}</span>
              <h3 className="font-bold mt-1 mb-2">{c.title}</h3>
              <p className="text-sm text-[#8B8FC0] line-clamp-2">{c.description}</p>
              <div className="mt-3 text-sm font-bold text-accent">{c.price.toLocaleString('fa-IR')} تومان</div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/courses" className="text-accent hover:underline text-sm font-bold">مشاهده همه دوره‌ها ←</Link>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-black mb-6">نظرات دانش‌آموزان</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.id} className="card">
                <p className="text-sm text-[#C4C7ED] mb-3">«{t.text}»</p>
                <div className="text-xs text-accent font-bold">{t.student_name}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {news.length > 0 && (
        <section id="news" className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-black mb-6">اخبار</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {news.map((n) => (
              <div key={n.id} className="card">
                <h3 className="font-bold mb-2">{n.title}</h3>
                <p className="text-sm text-[#8B8FC0] line-clamp-3">{n.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {documents.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-black mb-6">مجوزها و مدارک آموزشگاه</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {documents.map((d) => (
              <a key={d.id} href={docUrl(d.file_path)} target="_blank" rel="noreferrer" className="card hover:border-accent/40 transition-all block text-center">
                <div className="text-3xl mb-2">📄</div>
                <div className="text-sm font-bold">{d.title}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section id="faq" className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-black mb-6">سؤالات متداول</h2>
          <div className="space-y-2">
            {faqs.map((f) => (
              <div key={f.id} className="card !py-3">
                <button
                  className="w-full text-right flex justify-between items-center font-bold"
                  onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)}
                >
                  {f.question}
                  <span className="text-accent">{openFaq === f.id ? '−' : '+'}</span>
                </button>
                {openFaq === f.id && <p className="text-sm text-[#8B8FC0] mt-3">{f.answer}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
      }
