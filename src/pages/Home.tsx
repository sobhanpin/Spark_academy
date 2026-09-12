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

  const cardShadow = '0 2px 0 rgba(255,255,255,0.04) inset, 0 -12px 30px rgba(0,0,0,0.35) inset, 0 20px 45px -18px rgba(0,0,0,0.6), 0 4px 14px rgba(0,0,0,0.3)'
  const heroShadow = '0 2px 0 rgba(255,255,255,0.07) inset, 0 -24px 60px rgba(0,0,0,0.42) inset, 0 50px 100px -25px rgba(0,0,0,0.7), 0 0 70px -12px var(--glow-violet)'

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true" style={{ background: 'radial-gradient(ellipse 90% 55% at 50% -10%, rgba(91,50,196,0.28), transparent), radial-gradient(ellipse 60% 45% at 100% 25%, rgba(139,92,246,0.16), transparent), radial-gradient(ellipse 50% 35% at 0% 70%, rgba(255,122,61,0.08), transparent)' }} />
      <div className="pointer-events-none fixed top-[-12%] right-[-12%] w-[48rem] h-[48rem] rounded-full opacity-40 blur-3xl -z-10" style={{ background: 'radial-gradient(circle, var(--glow-violet), transparent 70%)' }} aria-hidden="true" />
      <div className="pointer-events-none fixed bottom-[-15%] left-[-10%] w-[40rem] h-[40rem] rounded-full opacity-30 blur-3xl -z-10" style={{ background: 'radial-gradient(circle, var(--glow-gold), transparent 70%)' }} aria-hidden="true" />
      <div className="pointer-events-none fixed top-[45%] left-[15%] w-[28rem] h-[28rem] rounded-full opacity-20 blur-3xl -z-10" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)' }} aria-hidden="true" />

      {/* ===== HERO ===== */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-20">
        <div
          className="relative overflow-hidden rounded-3xl px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16"
          style={{
            background: 'linear-gradient(155deg, rgba(139,92,246,0.14), rgba(23,20,61,0.5) 40%, rgba(10,9,24,0.6))',
            border: '1px solid rgba(180,150,255,0.18)',
            boxShadow: heroShadow,
          }}
        >
          <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.06), transparent 40%)' }} aria-hidden="true" />
          <svg className="absolute inset-0 w-full h-full opacity-50 pointer-events-none" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 500" aria-hidden="true">
            <defs>
              <radialGradient id="softGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF7A3D" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#FF7A3D" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="650" cy="120" r="220" fill="url(#softGlow)" />
          </svg>

          <div className="relative grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div className="perspective-1000 order-2 lg:order-1 text-center lg:text-right">
              <span className="relative inline-flex items-center gap-1.5 text-xs font-bold text-accent tracking-wide rounded-pill px-3.5 py-1.5 mb-6" style={{ background: 'rgba(255,255,255,0.06)', boxShadow: 'var(--shadow-neumo-out)' }}>
                🎓 آموزشگاه توسعه‌کاران ستایش
              </span>

              <h1 className="text-3xl sm:text-5xl lg:text-[3.6rem] font-black leading-tight mb-5">
                <span className="bg-gradient-to-l from-accent via-accent2 to-violetlight bg-clip-text text-transparent">
                  {settings.hero_title || 'اسپارک باش، مسیرتو روشن کن'}
                </span>
              </h1>

              <p className="text-[#A8ACD9] text-sm sm:text-base max-w-xl mx-auto lg:mx-0 mb-9 leading-relaxed">
                {settings.hero_subtitle || 'زبان، کنکور، مهارت‌های فنی — هر مسیری که انتخاب کنی، ما همراهتیم. حضوری یا آنلاین، انتخاب با توئه.'}
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3.5">
                <Link
                  to="/courses"
                  className="flex items-center justify-center gap-2 font-bold px-7 py-3.5 rounded-btn text-bg transition-all duration-300 ease-smooth-3d hover:-translate-y-1 active:translate-y-0.5 active:scale-[0.97]"
                  style={{
                    background: 'linear-gradient(135deg, #FFC168, #FF7A3D)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 -6px 14px rgba(0,0,0,0.25) inset, 0 14px 30px -8px rgba(255,122,61,0.55), 0 0 30px -6px var(--glow-gold)',
                  }}
                >
                  مشاهده دوره‌ها <span aria-hidden="true">←</span>
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center justify-center font-bold px-6 py-3.5 rounded-btn text-[#E4D9FF] transition-all duration-300 ease-smooth-3d hover:-translate-y-1 active:translate-y-0.5 active:scale-[0.97]"
                  style={{
                    background: 'linear-gradient(160deg, rgba(139,92,246,0.3), rgba(91,50,196,0.18))',
                    border: '1px solid rgba(180,150,255,0.25)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.15) inset, 0 -8px 16px rgba(0,0,0,0.2) inset, 0 10px 24px -10px rgba(139,92,246,0.5)',
                  }}
                >
                  تماس با ما
                </Link>
              </div>
            </div>

            {/* --- large 3D educational composition --- */}
            <div className="relative order-1 lg:order-2 h-64 sm:h-80 lg:h-[24rem] perspective-1000" aria-hidden="true">
              <div className="absolute inset-0 rounded-full blur-3xl opacity-60" style={{ background: 'radial-gradient(circle, var(--glow-violet), transparent 70%)' }} />

              <div
                className="absolute top-[2%] left-[4%] w-9 h-9 sm:w-12 sm:h-12 rounded-full motion-safe:animate-glow-pulse"
                style={{ background: 'radial-gradient(circle at 35% 30%, #FFE3B0, #FFC168 45%, #FF7A3D 100%)', boxShadow: '0 0 25px 6px rgba(255,193,104,0.45), 0 0 50px 12px rgba(255,122,61,0.25)' }}
              />

              {/* floating glass cards */}
              <div className="hidden sm:block absolute top-[6%] right-[4%] w-16 h-16 lg:w-20 lg:h-20 rounded-2xl motion-safe:animate-float" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: cardShadow, transform: 'rotate(-10deg)' }}>
                <div className="w-full h-full grid place-items-center text-2xl">📖</div>
              </div>
              <div className="hidden sm:block absolute bottom-[10%] right-[2%] w-14 h-14 lg:w-16 lg:h-16 rounded-2xl motion-safe:animate-float" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: cardShadow, transform: 'rotate(8deg)', animationDelay: '1.1s' }}>
                <div className="w-full h-full grid place-items-center text-xl">📜</div>
              </div>

              {/* books stack + open book + graduation cap — layered SVG composition, focal point */}
              <div className="absolute inset-0 grid place-items-center">
                <svg viewBox="0 0 260 220" className="w-56 sm:w-64 lg:w-72 drop-shadow-[0_25px_40px_rgba(0,0,0,0.55)]">
                  <defs>
                    <linearGradient id="bookA" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#5B32C4" /><stop offset="100%" stopColor="#3A1F8A" />
                    </linearGradient>
                    <linearGradient id="bookB" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FFC168" /><stop offset="100%" stopColor="#FF7A3D" />
                    </linearGradient>
                    <linearGradient id="bookC" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#B69CFF" /><stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                    <linearGradient id="capG" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#E4D9FF" /><stop offset="100%" stopColor="#7C4FE0" />
                    </linearGradient>
                  </defs>

                  {/* platform / base shadow */}
                  <ellipse cx="130" cy="200" rx="90" ry="12" fill="#000" opacity="0.35" />

                  {/* stacked books */}
                  <rect x="50" y="150" width="160" height="26" rx="6" fill="url(#bookA)" />
                  <rect x="60" y="126" width="140" height="26" rx="6" fill="url(#bookB)" />
                  <rect x="72" y="102" width="116" height="26" rx="6" fill="url(#bookC)" />

                  {/* open book on top */}
                  <path d="M130 78 L82 92 V104 L130 92 L178 104 V92 Z" fill="#FFF6E5" opacity="0.95" />
                  <path d="M130 78 L130 92" stroke="#D9C79A" strokeWidth="1.5" />

                  {/* graduation cap */}
                  <ellipse cx="150" cy="55" rx="46" ry="15" fill="url(#capG)" />
                  <ellipse cx="150" cy="50" rx="46" ry="15" fill="#fff" opacity="0.2" />
                  <rect x="128" y="58" width="44" height="18" rx="7" fill="#5B32C4" />
                  <circle cx="188" cy="60" r="4.5" fill="#FFC168" />
                  <path d="M188 60 L188 82" stroke="#FFC168" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="188" cy="85" r="3.2" fill="#FF7A3D" />
                </svg>
              </div>

              <div className="hidden lg:block absolute top-[10%] left-[10%] w-8 h-8 rounded-xl opacity-70 motion-safe:animate-float" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', animationDelay: '2s' }} />
              <div className="hidden lg:block absolute bottom-[6%] left-[18%] w-6 h-6 rounded-lg opacity-60 motion-safe:animate-float" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== COURSES ===== */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">دوره‌های آموزشی <span className="text-xl">🎒</span></h2>
            <p className="text-xs text-muted mt-1.5">با بهترین اساتید و جدیدترین روش‌های آموزشی</p>
          </div>
          <Link
            to="/courses"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-pill transition-transform duration-300 hover:-translate-y-0.5"
            style={{ background: 'rgba(255,255,255,0.06)', boxShadow: 'var(--shadow-neumo-out)' }}
          >
            مشاهده همه دوره‌ها ←
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className="group relative rounded-card overflow-hidden block transition-all duration-300 ease-smooth-3d hover:-translate-y-2.5 hover:scale-[1.015]"
              style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.08)', boxShadow: cardShadow }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/30 to-transparent" aria-hidden="true" />
              {c.image_url ? (
                <div className="overflow-hidden relative m-2 rounded-2xl" style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.35)' }}>
                  <img src={c.image_url} alt={c.title} className="w-full h-32 object-cover transition-transform duration-500 ease-smooth-3d group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" aria-hidden="true" />
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2.5 py-1 rounded-pill" style={{ background: 'rgba(10,9,24,0.6)', color: '#FFC168', backdropFilter: 'blur(4px)' }}>{c.category}</span>
                </div>
              ) : (
                <div className="w-full h-32 m-2 rounded-2xl bg-gradient-to-br from-violet/30 to-accent/20" style={{ width: 'calc(100% - 1rem)' }} />
              )}
              <div className="p-4 pt-2 relative">
                <h3 className="font-bold mb-2">{c.title}</h3>
                <p className="text-sm text-[#8B8FC0] line-clamp-2">{c.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-accent">{c.price.toLocaleString('fa-IR')} تومان</span>
                  <span className="w-8 h-8 rounded-full grid place-items-center text-xs text-accent transition-all duration-300 group-hover:-translate-x-1" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'var(--shadow-neumo-out)' }}>←</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8 sm:hidden">
          <Link to="/courses" className="text-accent hover:underline text-sm font-bold">مشاهده همه دوره‌ها ←</Link>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      {testimonials.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div
            className="rounded-3xl p-6 sm:p-10"
            style={{ background: 'linear-gradient(160deg, rgba(139,92,246,0.08), rgba(255,255,255,0.02))', border: '1px solid rgba(180,150,255,0.14)', boxShadow: 'var(--shadow-glass)' }}
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">نظرات زبان‌آموزان <span className="text-xl">💬</span></h2>
              <p className="text-xs text-muted mt-1.5">موفقیت شما افتخار ماست</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="relative rounded-card p-5 transition-all duration-300 ease-smooth-3d hover:-translate-y-2" style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.08)', boxShadow: cardShadow }}>
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/25 to-transparent" aria-hidden="true" />
                  <div className="w-9 h-9 rounded-xl grid place-items-center text-lg mb-3 text-violetlight" style={{ background: 'rgba(139,92,246,0.15)', boxShadow: 'var(--shadow-neumo-out)' }}>"</div>
                  <p className="text-sm text-[#C4C7ED] leading-relaxed mb-4">{t.text}</p>
                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent2 grid place-items-center text-[11px] font-bold text-bg" style={{ boxShadow: 'var(--shadow-neumo-out), 0 0 0 2px rgba(255,193,104,0.25)' }}>
                      {t.student_name?.charAt(0)}
                    </span>
                    <span className="text-xs text-accent font-bold">{t.student_name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== NEWS ===== */}
      {news.length > 0 && (
        <section id="news" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">آخرین اخبار <span className="text-xl">📰</span></h2>
            <p className="text-xs text-muted mt-1.5">از جدیدترین رویدادها و اطلاعیه‌ها باخبر باشید</p>
          </div>
          <div className="grid sm:grid-cols-3 xl:grid-cols-4 gap-6">
            {news.map((n) => (
              <div key={n.id} className="relative rounded-card p-5 transition-all duration-300 ease-smooth-3d hover:-translate-y-2" style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.08)', boxShadow: cardShadow }}>
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/25 to-transparent" aria-hidden="true" />
                <span className="inline-flex w-10 h-10 rounded-xl items-center justify-center text-base mb-3" style={{ background: 'rgba(255,193,104,0.12)', boxShadow: 'var(--shadow-neumo-out)' }}>📰</span>
                <h3 className="font-bold mb-2">{n.title}</h3>
                <p className="text-sm text-[#8B8FC0] line-clamp-3 leading-relaxed">{n.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== DOCUMENTS + FAQ (balanced two columns on large screens) ===== */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-10">
          {documents.length > 0 && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">مدارک و مستندات <span className="text-xl">📁</span></h2>
                <p className="text-xs text-muted mt-1.5">اطلاعات و مدارک موردنیاز را دریافت کنید</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {documents.map((d) => (
                  <a key={d.id} href={docUrl(d.file_path)} target="_blank" rel="noreferrer" className="relative rounded-card p-5 text-center block transition-all duration-300 ease-smooth-3d hover:-translate-y-2" style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.08)', boxShadow: cardShadow }}>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/25 to-transparent" aria-hidden="true" />
                    <div className="w-14 h-14 mx-auto rounded-2xl grid place-items-center text-2xl mb-3" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'var(--shadow-neumo-out)' }}>📄</div>
                    <div className="text-sm font-bold">{d.title}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {faqs.length > 0 && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">سؤالات متداول <span className="text-xl">❓</span></h2>
                <p className="text-xs text-muted mt-1.5">پاسخ سؤالات رایج را پیدا کنید</p>
              </div>
              <div className="space-y-3.5">
                {faqs.map((f) => {
                  const isOpen = openFaq === f.id
                  return (
                    <div key={f.id} className="relative rounded-btn overflow-hidden transition-all duration-300" style={{ background: isOpen ? 'linear-gradient(160deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))' : 'linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.08)', boxShadow: isOpen ? cardShadow : 'var(--shadow-glass)' }}>
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/25 to-transparent" aria-hidden="true" />
                      <button className="w-full text-right flex justify-between items-center font-bold px-5 py-4" onClick={() => setOpenFaq(isOpen ? null : f.id)}>
                        <span>{f.question}</span>
                        <span className="w-7 h-7 shrink-0 rounded-full grid place-items-center text-accent text-sm transition-transform duration-300" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'var(--shadow-neumo-out)', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 animate-fade-up">
                          <p className="text-sm text-[#8B8FC0] leading-relaxed rounded-btn p-3.5" style={{ background: 'rgba(0,0,0,0.15)', boxShadow: 'var(--shadow-neumo-in)' }}>{f.answer}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
                                                                                    }
