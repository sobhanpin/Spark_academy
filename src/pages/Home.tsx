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

  // Shared multi-layer shadow recipes for real depth (outer dark blur + colored ambient + inner top highlight)
  const cardShadow = '0 2px 0 rgba(255,255,255,0.04) inset, 0 -12px 30px rgba(0,0,0,0.35) inset, 0 20px 45px -18px rgba(0,0,0,0.6), 0 4px 14px rgba(0,0,0,0.3)'
  const heroShadow = '0 2px 0 rgba(255,255,255,0.06) inset, 0 -20px 50px rgba(0,0,0,0.4) inset, 0 40px 90px -20px rgba(0,0,0,0.65), 0 0 60px -10px var(--glow-violet)'

  return (
    <div className="relative overflow-hidden">
      {/* ===== Page-wide atmosphere: deep indigo base + layered purple/violet/gold glows ===== */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(91,50,196,0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 30%, rgba(139,92,246,0.15), transparent)' }} />
      <div className="pointer-events-none fixed top-[-10%] right-[-10%] w-[45rem] h-[45rem] rounded-full opacity-40 blur-3xl -z-10" style={{ background: 'radial-gradient(circle, var(--glow-violet), transparent 70%)' }} aria-hidden="true" />
      <div className="pointer-events-none fixed bottom-[-15%] left-[-10%] w-[38rem] h-[38rem] rounded-full opacity-30 blur-3xl -z-10" style={{ background: 'radial-gradient(circle, var(--glow-gold), transparent 70%)' }} aria-hidden="true" />
      <div className="pointer-events-none fixed top-[40%] left-[20%] w-[26rem] h-[26rem] rounded-full opacity-20 blur-3xl -z-10" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)' }} aria-hidden="true" />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-60" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 500">
          <defs>
            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFB84D" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="wave2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FFB84D" stopOpacity="0.06" />
            </linearGradient>
            <radialGradient id="softGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF7A3D" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#FF7A3D" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="170" cy="140" r="240" fill="url(#softGlow)" />
          <path d="M-40 200 Q210 80 400 220 T840 190 V-40 H-40 Z" fill="url(#wave1)" opacity="0.55" />
          <path d="M-40 440 Q230 300 420 420 T840 380 V640 H-40 Z" fill="url(#wave2)" opacity="0.5" />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 relative">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-6 items-center">

            {/* --- Text / glass hero panel --- */}
            <div className="perspective-1000 order-2 lg:order-1">
              <div
                className="relative glass-panel rounded-3xl px-6 sm:px-12 py-10 sm:py-14 text-center lg:text-right animate-fade-up transition-transform duration-500 ease-smooth-3d hover:-translate-y-1.5"
                style={{ boxShadow: heroShadow, borderColor: 'rgba(255,255,255,0.09)' }}
              >
                <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.07), transparent 45%)' }} aria-hidden="true" />

                <span className="relative inline-flex items-center gap-1.5 text-xs font-bold text-accent tracking-wide bg-white/5 rounded-pill px-3.5 py-1.5 mb-6 shadow-neumo-out">
                  🎓 آموزشگاه توسعه‌کاران ستایش
                </span>

                <h1 className="relative text-3xl sm:text-5xl lg:text-[3.4rem] font-black leading-tight mb-5">
                  <span className="bg-gradient-to-l from-accent via-accent2 to-violetlight bg-clip-text text-transparent">
                    {settings.hero_title || 'اسپارک باش، مسیرتو روشن کن'}
                  </span>
                </h1>

                <p className="relative text-[#A8ACD9] text-sm sm:text-base max-w-xl mx-auto lg:mx-0 mb-9 leading-relaxed">
                  {settings.hero_subtitle || 'زبان، کنکور، مهارت‌های فنی — هر مسیری که انتخاب کنی، ما همراهتیم. حضوری یا آنلاین، انتخاب با توئه.'}
                </p>

                <div className="relative flex flex-col sm:flex-row justify-center lg:justify-start gap-3.5">
                  <Link
                    to="/courses"
                    className="relative flex items-center justify-center gap-2 font-bold px-7 py-3.5 rounded-btn text-bg transition-all duration-300 ease-smooth-3d hover:-translate-y-1 active:translate-y-0 active:scale-[0.97]"
                    style={{
                      background: 'linear-gradient(135deg, #FFD48A 0%, var(--color-bg, #0A0918) 0%, #FFC168 15%, #FF7A3D 100%)',
                      boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 -6px 14px rgba(0,0,0,0.25) inset, 0 14px 30px -8px rgba(255,122,61,0.55), 0 0 30px -6px var(--glow-gold)',
                    }}
                  >
                    مشاهده دوره‌ها <span aria-hidden="true">←</span>
                  </Link>
                  <Link
                    to="/contact"
                    className="bg-white/5 hover:bg-white/10 px-6 py-3.5 rounded-btn font-bold shadow-neumo-out hover:-translate-y-1 active:translate-y-0 active:shadow-neumo-in transition-all duration-300 ease-smooth-3d"
                  >
                    تماس با ما
                  </Link>
                </div>
              </div>
            </div>

            {/* --- Decorative 3D educational composition (desktop-prominent, lighter on mobile) --- */}
            <div className="relative order-1 lg:order-2 h-56 sm:h-72 lg:h-[26rem] perspective-1000" aria-hidden="true">
              {/* ambient glow behind the cluster */}
              <div className="absolute inset-0 rounded-full blur-3xl opacity-50" style={{ background: 'radial-gradient(circle, var(--glow-violet), transparent 70%)' }} />

              {/* floating glass card 1 (certificate) */}
              <div
                className="absolute top-[8%] right-[8%] sm:right-[14%] w-40 sm:w-48 lg:w-56 rounded-2xl glass-panel p-4 motion-safe:animate-float"
                style={{ boxShadow: cardShadow, transform: 'rotate(-6deg)' }}
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accent2 grid place-items-center text-base mb-2 shadow-glow-gold">🏆</div>
                <div className="h-2 w-3/4 rounded-full bg-white/15 mb-1.5" />
                <div className="h-2 w-1/2 rounded-full bg-white/10" />
              </div>

              {/* floating glass card 2 (book) */}
              <div
                className="hidden sm:block absolute bottom-[6%] left-[6%] lg:left-[10%] w-36 lg:w-44 rounded-2xl glass-panel p-4 motion-safe:animate-float"
                style={{ boxShadow: cardShadow, transform: 'rotate(5deg)', animationDelay: '1.4s' }}
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet to-violetdeep grid place-items-center text-base mb-2 shadow-glow-violet">📘</div>
                <div className="h-2 w-2/3 rounded-full bg-white/15 mb-1.5" />
                <div className="h-2 w-2/5 rounded-full bg-white/10" />
              </div>

              {/* graduation cap — SVG, layered depth via gradient + soft shadow */}
              <div className="absolute top-[38%] left-[28%] sm:left-[34%] w-24 sm:w-32 lg:w-40 motion-safe:animate-float" style={{ animationDelay: '0.7s' }}>
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_18px_30px_rgba(0,0,0,0.5)]">
                  <defs>
                    <linearGradient id="capGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#B69CFF" />
                      <stop offset="100%" stopColor="#5B32C4" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="50" cy="38" rx="44" ry="15" fill="url(#capGrad2)" />
                  <ellipse cx="50" cy="33" rx="44" ry="15" fill="#E4D9FF" opacity="0.3" />
                  <rect x="28" y="42" width="44" height="18" rx="7" fill="#7C4FE0" />
                  <circle cx="86" cy="44" r="4.5" fill="#FFC168" />
                  <path d="M86 44 L86 68" stroke="#FFC168" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="86" cy="71" r="3.2" fill="#FF7A3D" />
                </svg>
              </div>

              {/* small floating glass squares for extra depth layering */}
              <div className="hidden lg:block absolute top-[12%] left-[12%] w-9 h-9 rounded-xl glass-panel rotate-[20deg] opacity-70 motion-safe:animate-float" style={{ animationDelay: '2s' }} />
              <div className="hidden lg:block absolute bottom-[16%] right-[20%] w-7 h-7 rounded-lg glass-panel -rotate-[15deg] opacity-60 motion-safe:animate-float" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== COURSES ===== */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-block w-10 h-1 rounded-full bg-gradient-to-l from-accent to-accent2 mb-3" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-black">دوره‌های ما</h2>
          </div>
          <span className="hidden sm:block text-xs text-muted">جدیدترین دوره‌های فعال</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className="group relative rounded-card overflow-hidden block transition-all duration-300 ease-smooth-3d hover:-translate-y-2.5 hover:scale-[1.015]"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: cardShadow,
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/30 to-transparent" aria-hidden="true" />
              {c.image_url ? (
                <div className="overflow-hidden relative m-2 rounded-2xl" style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.35)' }}>
                  <img
                    src={c.image_url}
                    alt={c.title}
                    className="w-full h-32 object-cover transition-transform duration-500 ease-smooth-3d group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" aria-hidden="true" />
                </div>
              ) : (
                <div className="w-full h-32 m-2 rounded-2xl bg-gradient-to-br from-violet/30 to-accent/20" style={{ width: 'calc(100% - 1rem)' }} />
              )}
              <div className="p-4 pt-2 relative">
                <span className="text-xs text-accent font-bold">{c.category}</span>
                <h3 className="font-bold mt-1 mb-2">{c.title}</h3>
                <p className="text-sm text-[#8B8FC0] line-clamp-2">{c.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-accent">{c.price.toLocaleString('fa-IR')} تومان</span>
                  <span
                    className="w-8 h-8 rounded-full grid place-items-center text-xs text-accent transition-all duration-300 group-hover:-translate-x-1"
                    style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'var(--shadow-neumo-out)' }}
                  >
                    ←
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/courses" className="text-accent hover:underline text-sm font-bold">مشاهده همه دوره‌ها ←</Link>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      {testimonials.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mb-8">
            <span className="inline-block w-10 h-1 rounded-full bg-gradient-to-l from-violet to-violetlight mb-3" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-black">نظرات دانش‌آموزان</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="relative rounded-card p-5 transition-all duration-300 ease-smooth-3d hover:-translate-y-2"
                style={{
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: cardShadow,
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/25 to-transparent" aria-hidden="true" />
                <div
                  className="w-9 h-9 rounded-xl grid place-items-center text-lg mb-3 text-violetlight"
                  style={{ background: 'rgba(139,92,246,0.15)', boxShadow: 'var(--shadow-neumo-out)' }}
                >
                  "
                </div>
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

      {/* ===== NEWS ===== */}
      {news.length > 0 && (
        <section id="news" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mb-8">
            <span className="inline-block w-10 h-1 rounded-full bg-gradient-to-l from-accent to-accent2 mb-3" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-black">اخبار</h2>
          </div>
          <div className="grid sm:grid-cols-3 xl:grid-cols-4 gap-6">
            {news.map((n) => (
              <div
                key={n.id}
                className="relative rounded-card p-5 transition-all duration-300 ease-smooth-3d hover:-translate-y-2"
                style={{
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: cardShadow,
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/25 to-transparent" aria-hidden="true" />
                <span
                  className="inline-flex w-10 h-10 rounded-xl items-center justify-center text-base mb-3"
                  style={{ background: 'rgba(255,193,104,0.12)', boxShadow: 'var(--shadow-neumo-out)' }}
                >
                  📰
                </span>
                <h3 className="font-bold mb-2">{n.title}</h3>
                <p className="text-sm text-[#8B8FC0] line-clamp-3 leading-relaxed">{n.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== DOCUMENTS ===== */}
      {documents.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mb-8">
            <span className="inline-block w-10 h-1 rounded-full bg-gradient-to-l from-violet to-violetlight mb-3" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-black">مجوزها و مدارک آموزشگاه</h2>
          </div>
          <div className="grid sm:grid-cols-3 xl:grid-cols-4 gap-6">
            {documents.map((d) => (
              <a
                key={d.id}
                href={docUrl(d.file_path)}
                target="_blank"
                rel="noreferrer"
                className="relative rounded-card p-5 text-center block transition-all duration-300 ease-smooth-3d hover:-translate-y-2"
                style={{
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: cardShadow,
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/25 to-transparent" aria-hidden="true" />
                <div
                  className="w-14 h-14 mx-auto rounded-2xl grid place-items-center text-2xl mb-3"
                  style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'var(--shadow-neumo-out)' }}
                >
                  📄
                </div>
                <div className="text-sm font-bold">{d.title}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ===== FAQ ===== */}
      {faqs.length > 0 && (
        <section id="faq" className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mb-8">
            <span className="inline-block w-10 h-1 rounded-full bg-gradient-to-l from-accent to-accent2 mb-3" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-black">سؤالات متداول</h2>
          </div>
          <div className="space-y-3.5">
            {faqs.map((f) => {
              const isOpen = openFaq === f.id
              return (
                <div
                  key={f.id}
                  className="relative rounded-btn overflow-hidden transition-all duration-300"
                  style={{
                    background: isOpen ? 'linear-gradient(160deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))' : 'linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isOpen ? cardShadow : 'var(--shadow-glass)',
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/25 to-transparent" aria-hidden="true" />
                  <button
                    className="w-full text-right flex justify-between items-center font-bold px-5 py-4"
                    onClick={() => setOpenFaq(isOpen ? null : f.id)}
                  >
                    <span>{f.question}</span>
                    <span
                      className="w-7 h-7 shrink-0 rounded-full grid place-items-center text-accent text-sm transition-transform duration-300"
                      style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'var(--shadow-neumo-out)', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 animate-fade-up">
                      <p
                        className="text-sm text-[#8B8FC0] leading-relaxed rounded-btn p-3.5"
                        style={{ background: 'rgba(0,0,0,0.15)', boxShadow: 'var(--shadow-neumo-in)' }}
                      >
                        {f.answer}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
    }
