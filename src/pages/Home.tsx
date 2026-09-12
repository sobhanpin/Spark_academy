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
    <div className="relative overflow-hidden">
      {/* Ambient background glow layer — page-wide, very subtle */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, var(--glow-violet), transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, var(--glow-gold), transparent 70%)' }} />
      </div>

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

        {/* Floating decorative educational elements — CSS/SVG only, purely decorative */}
        <div className="hidden sm:block absolute top-16 left-[6%] w-20 h-20 lg:w-24 lg:h-24 motion-safe:animate-float opacity-90 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
            <defs>
              <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#5B32C4" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="40" rx="42" ry="14" fill="url(#capGrad)" />
            <ellipse cx="50" cy="36" rx="42" ry="14" fill="#B69CFF" opacity="0.25" />
            <rect x="30" y="44" width="40" height="16" rx="6" fill="#8B5CF6" />
            <circle cx="82" cy="46" r="4" fill="#FFC168" />
            <path d="M82 46 L82 66" stroke="#FFC168" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="82" cy="68" r="3" fill="#FFC168" />
          </svg>
        </div>

        <div
          className="hidden sm:block absolute bottom-10 right-[7%] w-16 h-16 lg:w-20 lg:h-20 motion-safe:animate-float opacity-90 pointer-events-none"
          style={{ animationDelay: '1.2s' }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
            <defs>
              <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFC168" />
                <stop offset="100%" stopColor="#FF7A3D" />
              </linearGradient>
            </defs>
            <rect x="15" y="55" width="70" height="14" rx="3" fill="url(#bookGrad)" />
            <rect x="18" y="40" width="64" height="14" rx="3" fill="#8B5CF6" opacity="0.9" />
            <rect x="22" y="25" width="56" height="14" rx="3" fill="url(#bookGrad)" opacity="0.85" />
          </svg>
        </div>

        <div className="hidden lg:block absolute top-1/3 right-[3%] w-10 h-10 rounded-2xl glass-panel rotate-[18deg] opacity-60 pointer-events-none motion-safe:animate-float" style={{ animationDelay: '0.6s' }} aria-hidden="true" />
        <div className="hidden lg:block absolute bottom-1/4 left-[4%] w-8 h-8 rounded-xl glass-panel -rotate-[12deg] opacity-50 pointer-events-none motion-safe:animate-float" style={{ animationDelay: '1.8s' }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 relative">
          <div className="max-w-3xl mx-auto perspective-1000">
            <div
              className="relative glass-panel rounded-3xl px-6 sm:px-14 py-10 sm:py-16 text-center animate-fade-up transition-transform duration-500 ease-smooth-3d hover:-translate-y-1"
              style={{
                boxShadow: 'var(--shadow-glass), 0 30px 80px -20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              {/* Inner highlight layer for extra depth */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.05), transparent 40%)' }}
                aria-hidden="true"
              />

              <span className="relative inline-flex items-center gap-1.5 text-xs font-bold text-accent tracking-wide bg-white/5 rounded-pill px-3.5 py-1.5 mb-6 shadow-neumo-out">
                🎓 آموزشگاه توسعه‌کاران ستایش
              </span>

              <h1 className="relative text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-5">
                {settings.hero_title || 'اسپارک باش، مسیرتو روشن کن'}
              </h1>

              <p className="relative text-[#A8ACD9] text-sm sm:text-base max-w-xl mx-auto mb-9 leading-relaxed">
                {settings.hero_subtitle || 'زبان، کنکور، مهارت‌های فنی — هر مسیری که انتخاب کنی، ما همراهتیم. حضوری یا آنلاین، انتخاب با توئه.'}
              </p>

              <div className="relative flex flex-col sm:flex-row justify-center gap-3.5">
                <Link
                  to="/courses"
                  className="btn-primary shadow-glow-gold hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-transform duration-300 ease-smooth-3d flex items-center justify-center gap-2"
                  style={{ boxShadow: 'var(--shadow-glow-gold, 0 0 25px rgba(255,193,104,0.35)), 0 10px 25px -8px rgba(255,122,61,0.5)' }}
                >
                  مشاهده دوره‌ها
                  <span aria-hidden="true">←</span>
                </Link>
                <Link
                  to="/contact"
                  className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-btn font-bold shadow-neumo-out hover:-translate-y-1 active:translate-y-0 active:shadow-neumo-in transition-all duration-300 ease-smooth-3d"
                >
                  تماس با ما
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-block w-10 h-1 rounded-full bg-gradient-to-l from-accent to-accent2 mb-3" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-black">دوره‌های ما</h2>
          </div>
          <span className="hidden sm:block text-xs text-muted">جدیدترین دوره‌های فعال</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className="group glass-panel rounded-card overflow-hidden block transition-all duration-300 ease-smooth-3d hover:-translate-y-2"
              style={{ boxShadow: 'var(--shadow-glass), 0 4px 16px rgba(0,0,0,0.25)' }}
            >
              {c.image_url ? (
                <div className="overflow-hidden relative">
                  <img
                    src={c.image_url}
                    alt={c.title}
                    className="w-full h-36 object-cover transition-transform duration-500 ease-smooth-3d group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" aria-hidden="true" />
                </div>
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-violet/30 to-accent/20" />
              )}
              <div className="p-4 relative">
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
        <div className="text-center mt-10">
          <Link to="/courses" className="text-accent hover:underline text-sm font-bold">مشاهده همه دوره‌ها ←</Link>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mb-8">
            <span className="inline-block w-10 h-1 rounded-full bg-gradient-to-l from-violet to-violetlight mb-3" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-black">نظرات دانش‌آموزان</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="glass-panel rounded-card p-5 transition-transform duration-300 ease-smooth-3d hover:-translate-y-1.5"
                style={{ boxShadow: 'var(--shadow-glass)' }}
              >
                <div className="text-violetlight text-3xl leading-none mb-2 opacity-40 font-serif">"</div>
                <p className="text-sm text-[#C4C7ED] leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent2 grid place-items-center text-[11px] font-bold text-bg shadow-neumo-out">
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
        <section id="news" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mb-8">
            <span className="inline-block w-10 h-1 rounded-full bg-gradient-to-l from-accent to-accent2 mb-3" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-black">اخبار</h2>
          </div>
          <div className="grid sm:grid-cols-3 xl:grid-cols-4 gap-5">
            {news.map((n) => (
              <div
                key={n.id}
                className="glass-panel rounded-card p-5 transition-transform duration-300 ease-smooth-3d hover:-translate-y-1.5"
                style={{ boxShadow: 'var(--shadow-glass)' }}
              >
                <span className="inline-block w-9 h-9 rounded-xl bg-white/5 shadow-neumo-out grid place-items-center text-sm mb-3">📰</span>
                <h3 className="font-bold mb-2">{n.title}</h3>
                <p className="text-sm text-[#8B8FC0] line-clamp-3 leading-relaxed">{n.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {documents.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mb-8">
            <span className="inline-block w-10 h-1 rounded-full bg-gradient-to-l from-violet to-violetlight mb-3" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-black">مجوزها و مدارک آموزشگاه</h2>
          </div>
          <div className="grid sm:grid-cols-3 xl:grid-cols-4 gap-5">
            {documents.map((d) => (
              <a
                key={d.id}
                href={docUrl(d.file_path)}
                target="_blank"
                rel="noreferrer"
                className="glass-panel rounded-card p-5 text-center block transition-all duration-300 ease-smooth-3d hover:-translate-y-1.5"
                style={{ boxShadow: 'var(--shadow-glass)' }}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 shadow-neumo-out grid place-items-center text-2xl mb-3">📄</div>
                <div className="text-sm font-bold">{d.title}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section id="faq" className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mb-8">
            <span className="inline-block w-10 h-1 rounded-full bg-gradient-to-l from-accent to-accent2 mb-3" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-black">سؤالات متداول</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <div
                key={f.id}
                className="glass-panel rounded-btn overflow-hidden transition-shadow duration-300"
                style={{ boxShadow: 'var(--shadow-glass)' }}
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
