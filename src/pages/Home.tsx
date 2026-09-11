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
        <svg className="absolute inset-0 w-full h-full opacity-70" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 500">
          <defs>
            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFB84D" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="wave2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFB84D" stopOpacity="0.06" />
            </linearGradient>
            <radialGradient id="softGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF7A3D" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FF7A3D" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="170" cy="140" r="240" fill="url(#softGlow)" />
          <path d="M-40 200 Q210 80 400 220 T840 190 V-40 H-40 Z" fill="url(#wave1)" opacity="0.6" />
          <path d="M-40 440 Q230 300 420 420 T840 380 V640 H-40 Z" fill="url(#wave2)" opacity="0.55" />
          <path d="M-40 340 Q250 500 420 340 T840 400" fill="none" stroke="#FFB84D" strokeWidth="1.5" strokeOpacity="0.35" />
        </svg>

        <div className="hidden sm:block absolute top-10 right-[8%] w-16 h-16 rounded-2xl glass-panel rotate-[12deg] opacity-70 pointer-events-none" />
        <div className="hidden sm:block absolute bottom-8 left-[10%] w-12 h-12 rounded-xl glass-panel -rotate-[10deg] opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="max-w-3xl mx-auto perspective-1000">
            <div
              className="glass-panel rounded-3xl px-6 sm:px-12 py-10 sm:py-14 text-center animate-fade-up transition-transform duration-500 ease-smooth-3d hover:-translate-y-1"
              style={{ boxShadow: 'var(--shadow-glass), 0 20px 60px -20px rgba(0,0,0,0.5)' }}
            >
              <span className="inline-block text-xs font-bold text-accent tracking-wide bg-white/5 rounded-pill px-3 py-1 mb-5 shadow-neumo-out">
                آموزشگاه توسعه‌کاران ستایش
              </span>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
                {settings.hero_title || 'اسپارک باش، مسیرتو روشن کن'}
              </h1>

              <p className="text-[#A8ACD9] text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
                {settings.hero_subtitle || 'زبان، کنکور، مهارت‌های فنی — هر مسیری که انتخاب کنی، ما همراهتیم. حضوری یا آنلاین، انتخاب با توئه.'}
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  to="/courses"
                  className="btn-primary shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform duration-300"
                >
                  مشاهده دوره‌ها
                </Link>
                <Link
                  to="/contact"
                  className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-btn font-bold shadow-neumo-out hover:-translate-y-0.5 active:translate-y-0 active:shadow-neumo-in transition-all duration-300"
                >
                  تماس با ما
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-7">
          <h2 className="text-2xl sm:text-3xl font-black">دوره‌های ما</h2>
          <span className="hidden sm:block text-xs text-muted">جدیدترین دوره‌های فعال</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className="group glass-panel rounded-card overflow-hidden block transition-all duration-300 ease-smooth-3d hover:-translate-y-1.5"
              style={{ boxShadow: 'var(--shadow-glass)' }}
            >
              {c.image_url ? (
                <div className="overflow-hidden">
                  <img
                    src={c.image_url}
                    alt={c.title}
                    className="w-full h-36 object-cover transition-transform duration-500 ease-smooth-3d group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-violet/30 to-accent/20" />
              )}
              <div className="p-4">
                <span className="text-xs text-accent font-bold">{c.category}</span>
                <h3 className="font-bold mt-1 mb-2">{c.title}</h3>
                <p className="text-sm text-[#8B8FC0] line-clamp-2">{c.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-accent">{c.price.toLocaleString('fa-IR')} تومان</span>
                  <span className="w-7 h-7 rounded-full grid place-items-center bg-white/5 shadow-neumo-out text-xs text-accent transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-9">
          <Link to="/courses" className="text-accent hover:underline text-sm font-bold">مشاهده همه دوره‌ها ←</Link>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl sm:text-3xl font-black mb-7">نظرات دانش‌آموزان</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="glass-panel rounded-card p-5 transition-transform duration-300 ease-smooth-3d hover:-translate-y-1"
              >
                <div className="text-accent text-xl leading-none mb-2 opacity-50">"</div>
                <p className="text-sm text-[#C4C7ED] leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-accent2 grid place-items-center text-[10px] font-bold text-bg shadow-neumo-out">
                    {t.student_name?.charAt(0)}
                  </span>
                  <span className="text-xs text-accent font-bold">{t.student_name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {news.length > 0 && (
        <section id="news" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl sm:text-3xl font-black mb-7">اخبار</h2>
          <div className="grid sm:grid-cols-3 xl:grid-cols-4 gap-5">
            {news.map((n) => (
              <div
                key={n.id}
                className="glass-panel rounded-card p-5 transition-transform duration-300 ease-smooth-3d hover:-translate-y-1"
              >
                <span className="inline-block w-8 h-8 rounded-lg bg-white/5 shadow-neumo-out grid place-items-center text-sm mb-3">📰</span>
                <h3 className="font-bold mb-2">{n.title}</h3>
                <p className="text-sm text-[#8B8FC0] line-clamp-3 leading-relaxed">{n.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {documents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl sm:text-3xl font-black mb-7">مجوزها و مدارک آموزشگاه</h2>
          <div className="grid sm:grid-cols-3 xl:grid-cols-4 gap-5">
            {documents.map((d) => (
              <a
                key={d.id}
                href={docUrl(d.file_path)}
                target="_blank"
                rel="noreferrer"
                className="glass-panel rounded-card p-5 text-center block transition-all duration-300 ease-smooth-3d hover:-translate-y-1"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 shadow-neumo-out grid place-items-center text-2xl mb-3">📄</div>
                <div className="text-sm font-bold">{d.title}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl sm:text-3xl font-black mb-7">سؤالات متداول</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <div
                key={f.id}
                className="glass-panel rounded-btn overflow-hidden transition-shadow duration-300"
              >
                <button
                  className="w-full text-right flex justify-between items-center font-bold px-5 py-4"
                  onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)}
                >
                  <span>{f.question}</span>
                  <span
                    className="w-7 h-7 shrink-0 rounded-full bg-white/5 shadow-neumo-out grid place-items-center text-accent text-sm transition-transform duration-300"
                    style={{ transform: openFaq === f.id ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  >
                    +
                  </span>
                </button>
                {openFaq === f.id && (
                  <p className="text-sm text-[#8B8FC0] leading-relaxed px-5 pb-4 animate-fade-up">{f.answer}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
      }
