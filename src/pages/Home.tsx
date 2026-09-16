import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, Course, Testimonial, NewsItem, FaqItem, AcademyDocument } from '../lib/supabase'

const Icon = ({ name, className = 'w-5 h-5' }: { name: string; className?: string }) => {
  const paths: Record<string, JSX.Element> = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20"/></>,
    arrow: <><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3.5 20c.5-3.5 2.2-5.5 5.5-5.5s5 2 5.5 5.5"/><path d="M15 6.5a3 3 0 0 1 0 5.8M17 14.8c1.9.8 3.1 2.4 3.5 5.2"/></>,
    clock: <><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/></>,
    file: <><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5M9.5 13h5M9.5 16h5"/></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" fill="currentColor" stroke="none"/>,
    news: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></>,
    wrench: <path d="M14.7 6.3a4 4 0 0 0-5.6 5.1L3 17.5V21h3.5l6.1-6.1a4 4 0 0 0 5.1-5.6l-2.6 2.6-2-2 2.6-2.6Z"/>,
    pencil: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></>,
    cap: <><path d="m3 10 9-5 9 5-9 5-9-5Z"/><path d="M7 12.2V17c2.8 2 7.2 2 10 0v-4.8"/><path d="M21 10v6"/></>,
    certificate: <><path d="M5 4h14v12H5z"/><path d="M8 8h8M8 11h5"/><path d="m10 16 2 4 2-4"/></>,
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

const Stars = () => (
  <div className="flex gap-0.5 mb-3" style={{ color: 'var(--gold)' }} aria-hidden="true">
    {[1, 2, 3, 4, 5].map((i) => (
      <Icon key={i} name="star" className="w-3.5 h-3.5" />
    ))}
  </div>
)

const categoryIcon = (category: string) => {
  if (category === 'کنکور') return 'pencil'
  if (category === 'فنی') return 'wrench'
  return 'book'
}

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
    <main className="ref-home">
      <div className="ref-bg-glow ref-glow-a" aria-hidden="true" />
      <div className="ref-bg-glow ref-glow-b" aria-hidden="true" />
      <div className="ref-particles" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>

      {/* HERO */}
      <section className="ref-hero">
        <div className="ref-hero-copy">
          <div className="ref-kicker">
            <span/> آموزشگاه توسعه‌کاران ستایش
          </div>

          <h1>{settings.hero_title || 'اسپارک باش، مسیرتو روشن کن'}</h1>

          <p>
            {settings.hero_subtitle ||
              'زبان، کنکور و مهارت‌های فنی؛ آموزش حرفه‌ای با مسیر روشن، استادهای باتجربه و تجربه‌ای مدرن برای رشد واقعی.'}
          </p>

          <div className="ref-actions">
            <Link to="/courses" className="ref-btn ref-btn-gold">
              مشاهده دوره‌ها <Icon name="arrow" className="w-4 h-4"/>
            </Link>
            <Link to="/contact" className="ref-btn ref-btn-outline">
              با ما در ارتباط باشید
            </Link>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem', marginTop: '1.5rem', fontSize: '.68rem', color: '#9db3ca' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem' }}>
              <Icon name="users" className="w-4 h-4" /> آموزش برای همه
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem' }}>
              <Icon name="clock" className="w-4 h-4" /> حضوری و آنلاین
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem' }}>
              <Icon name="star" className="w-4 h-4" /> مسیر حرفه‌ای
            </span>
          </div>
        </div>

        {/* 3D SCENE */}
        <div className="ref-scene" aria-hidden="true">
          <svg viewBox="0 0 640 640" className="hero-scene-svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="coverNavy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#163f78" />
                <stop offset="1" stopColor="#081d3d" />
              </linearGradient>
              <linearGradient id="coverBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2e7fd6" />
                <stop offset="1" stopColor="#0d3868" />
              </linearGradient>
              <linearGradient id="coverGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#1a4a86" />
                <stop offset="1" stopColor="#081d3d" />
              </linearGradient>
              <linearGradient id="pagesCream" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#faf3dd" />
                <stop offset="1" stopColor="#e3cd97" />
              </linearGradient>
              <linearGradient id="goldMetal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffe29a" />
                <stop offset="1" stopColor="#ff9f1c" />
              </linearGradient>
              <radialGradient id="platformGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#168cff" stopOpacity=".55" />
                <stop offset="1" stopColor="#168cff" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="lightBeam" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#38b7ff" stopOpacity="0" />
                <stop offset=".5" stopColor="#38b7ff" stopOpacity=".8" />
                <stop offset="1" stopColor="#38b7ff" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#ffc94d" stopOpacity=".5" />
                <stop offset="1" stopColor="#ffc94d" stopOpacity="0" />
              </radialGradient>
              <filter id="softShadow" x="-60%" y="-60%" width="220%" height="220%">
                <feDropShadow dx="0" dy="14" stdDeviation="10" floodColor="#000" floodOpacity=".5" />
              </filter>
            </defs>

            {/* platform */}
            <ellipse className="hs-platform" cx="320" cy="565" rx="235" ry="58" fill="url(#platformGlow)" />
            <ellipse cx="320" cy="565" rx="150" ry="34" fill="none" stroke="#2e9cff" strokeWidth="2" opacity=".55" />

            {/* rotating light rings */}
            <g className="hs-ring">
              <ellipse cx="320" cy="430" rx="215" ry="68" fill="none" stroke="#2e9cff" strokeWidth="5" strokeDasharray="3 16" opacity=".5" />
            </g>
            <g className="hs-ring hs-ring-2">
              <ellipse cx="320" cy="448" rx="152" ry="46" fill="none" stroke="#ffc94d" strokeWidth="3" strokeDasharray="2 12" opacity=".55" />
            </g>

            {/* light beams */}
            <rect className="hs-light" x="165" y="40" width="4" height="170" fill="url(#lightBeam)" />
            <rect className="hs-light" x="480" y="65" width="4" height="150" fill="url(#lightBeam)" style={{ animationDelay: '-2s' }} />

            {/* particles */}
            <g fill="#78cfff">
              <circle className="hs-particle" cx="110" cy="150" r="3.5" style={{ animationDelay: '0s' }} />
              <circle className="hs-particle" cx="520" cy="120" r="3" style={{ animationDelay: '-2s' }} />
              <circle className="hs-particle" cx="540" cy="380" r="3.5" style={{ animationDelay: '-4s' }} />
              <circle className="hs-particle" cx="95" cy="380" r="3" style={{ animationDelay: '-1s' }} />
              <circle className="hs-particle" cx="330" cy="80" r="3" style={{ animationDelay: '-3s' }} />
            </g>

            {/* 3D book stack — the hero's main object, scaled up ~45% further (~1.85x total) */}
            <ellipse cx="305" cy="392" rx="195" ry="78" fill="url(#platformGlow)" opacity=".55" />
            <g transform="translate(305,375) scale(1.85) translate(-305,-375)" filter="url(#softShadow)">
              <g className="hs-books">
                <polygon points="150,400 380,400 460,366 230,366" fill="url(#coverNavy)" />
                <rect x="150" y="400" width="230" height="26" fill="url(#coverNavy)" />
                <polygon points="380,400 460,366 460,392 380,426" fill="url(#pagesCream)" />
                <line x1="380" y1="400" x2="460" y2="366" stroke="#ffc94d" strokeWidth="2" opacity=".8" />

                <polygon points="168,372 364,372 432,343 236,343" fill="url(#coverBlue)" />
                <rect x="168" y="372" width="196" height="22" fill="url(#coverBlue)" />
                <polygon points="364,372 432,343 432,365 364,394" fill="url(#pagesCream)" />
                <line x1="364" y1="372" x2="432" y2="343" stroke="#ffc94d" strokeWidth="2" opacity=".8" />

                <polygon points="190,347 340,347 392,325 242,325" fill="url(#coverGold)" />
                <rect x="190" y="347" width="150" height="18" fill="url(#coverGold)" />
                <polygon points="340,347 392,325 392,343 340,365" fill="url(#pagesCream)" />
                <line x1="340" y1="347" x2="392" y2="325" stroke="#ffc94d" strokeWidth="2.5" />
                <rect x="205" y="353" width="110" height="4" rx="2" fill="#ffc94d" opacity=".85" />
              </g>
            </g>

            {/* graduation cap — scaled ~30% larger, in place */}
            <g transform="translate(330,240) scale(1.3) translate(-330,-240)" filter="url(#softShadow)">
              <g className="hs-cap">
                <ellipse cx="330" cy="234" rx="34" ry="15" fill="url(#coverNavy)" />
                <polygon points="330,188 402,224 330,260 258,224" fill="url(#coverNavy)" stroke="#38b7ff" strokeWidth="1.5" opacity=".95" />
                <polygon points="330,188 402,224 330,232 258,224" fill="#1c4d8e" opacity=".55" />
                <circle cx="330" cy="224" r="7" fill="url(#goldMetal)" />
                <path d="M330,224 Q360,250 358,278" fill="none" stroke="url(#goldMetal)" strokeWidth="2.5" strokeLinecap="round" />
                <g stroke="url(#goldMetal)" strokeWidth="2" strokeLinecap="round">
                  <line x1="358" y1="278" x2="352" y2="294" />
                  <line x1="358" y1="278" x2="358" y2="296" />
                  <line x1="358" y1="278" x2="364" y2="294" />
                </g>
              </g>
            </g>

            {/* certificate — scaled ~35% larger, rotation moved outside the animated group */}
            <g transform="translate(462,320) rotate(-9) scale(1.35) translate(-462,-320)" filter="url(#softShadow)">
              <g className="hs-cert">
                <rect x="392" y="262" width="140" height="102" rx="5" fill="url(#goldMetal)" />
                <rect x="400" y="270" width="124" height="86" rx="3" fill="#faf6ea" />
                <text x="462" y="292" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0d3868" style={{ letterSpacing: '.5px' }}>CERTIFICATE</text>
                <rect x="415" y="300" width="94" height="3" fill="#c9cfd8" />
                <rect x="425" y="309" width="74" height="3" fill="#c9cfd8" />
                <circle cx="462" cy="336" r="13" fill="url(#goldMetal)" stroke="#0d3868" strokeWidth="1.5" />
                <path d="m457,336 3,4 7,-8" fill="none" stroke="#0d3868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M454,347 L458,368 L462,352 Z" fill="#0d3868" />
                <path d="M470,347 L466,368 L462,352 Z" fill="#0d3868" />
              </g>
            </g>

            {/* pencil — scaled ~40% larger with its own soft blue/gold glow */}
            <ellipse cx="159" cy="437" rx="78" ry="42" fill="url(#platformGlow)" opacity=".45" />
            <ellipse cx="180" cy="430" rx="50" ry="28" fill="url(#goldGlow)" opacity=".4" />
            <g transform="translate(159,437) scale(1.4) translate(-159,-437)" filter="url(#softShadow)">
              <g transform="rotate(-30 150 437)">
                <g className="hs-pencil">
                  <rect x="120" y="430" width="90" height="14" rx="3" fill="url(#goldMetal)" />
                  <polygon points="120,430 120,444 96,437" fill="#0d3868" />
                  <polygon points="108,433 108,441 96,437" fill="#04101f" />
                  <rect x="196" y="430" width="10" height="14" fill="#c9cfd8" />
                  <rect x="206" y="430" width="16" height="14" rx="3" fill="#ff8ba0" />
                </g>
              </g>
            </g>
          </svg>
        </div>
      </section>

      {/* WHY US */}
      <section className="ref-features" aria-label="مزایای آموزشگاه">
        <article>
          <span className="ref-feature-icon"><Icon name="cap"/></span>
          <div><b>دوره‌های آموزشی</b><small>زبان، کنکور و مهارت‌های فنی<br/>با اساتید مجرب</small></div>
          <em>↙</em>
        </article>
        <article>
          <span className="ref-feature-icon"><Icon name="users"/></span>
          <div><b>حضوری و آنلاین</b><small>آموزش برای همه، هر جا<br/>که باشید</small></div>
          <em>↙</em>
        </article>
        <article>
          <span className="ref-feature-icon"><Icon name="star"/></span>
          <div><b>مسیر حرفه‌ای</b><small>برنامه‌ای شفاف تا رسیدن<br/>به هدف</small></div>
          <em>↙</em>
        </article>
        <article>
          <span className="ref-feature-icon"><Icon name="certificate"/></span>
          <div><b>مدرک معتبر</b><small>ارائه گواهینامه پایان دوره<br/>با قابلیت استعلام</small></div>
          <em>↙</em>
        </article>
      </section>

      {/* COURSES */}
      <section className="ref-section" id="courses">
        <div className="ref-section-head">
          <div>
            <small>آموزش هدفمند</small>
            <h2>دوره‌های <strong>آموزشی</strong></h2>
            <p>با بهترین اساتید و جدیدترین روش‌های آموزشی.</p>
          </div>
          <Link to="/courses">مشاهده همه دوره‌ها <Icon name="arrow" className="w-4 h-4"/></Link>
        </div>

        <div className="ref-course-grid">
          {courses.map((c, index) => (
            <Link key={c.id} to={`/courses/${c.id}`} className="ref-course-card">
              <div className="ref-course-media">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.title} />
                ) : (
                  <div className="ref-course-fallback">
                    <Icon name={categoryIcon(c.category)} className="w-12 h-12" />
                  </div>
                )}
                <span>{c.category}</span>
                <b>۰{index + 1}</b>
              </div>
              <div className="ref-course-body">
                <h3>{c.title}</h3>
                {c.duration && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', color: '#43b8ff', fontSize: '.6rem', marginTop: '.3rem' }}>
                    <Icon name="clock" className="w-3.5 h-3.5" />
                    {c.duration}
                  </div>
                )}
                <p>{c.description}</p>
                <div>
                  <small>{c.price.toLocaleString('fa-IR')} تومان</small>
                  <i><Icon name="arrow" className="w-4 h-4" /></i>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.75rem' }} className="sm:hidden">
          <Link to="/courses" className="ref-btn ref-btn-outline" style={{ display: 'inline-flex' }}>
            مشاهده همه دوره‌ها
            <Icon name="arrow" className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section className="ref-stats">
        <div><span><Icon name="users"/></span><b>+۳۰۰۰</b><small>دانشجوی فعال</small></div>
        <div><span><Icon name="book"/></span><b>+{courses.length || 50}</b><small>دوره آموزشی</small></div>
        <div><span><Icon name="star"/></span><b>۹۵٪</b><small>رضایت دانشجویان</small></div>
        <div><span><Icon name="clock"/></span><b>+۸</b><small>سال سابقه فعالیت</small></div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="ref-section">
          <div className="ref-panel">
            <div className="ref-section-head" style={{ marginBottom: '2rem' }}>
              <div>
                <small>تجربه واقعی</small>
                <h2>نظرات <strong>زبان‌آموزان</strong></h2>
                <p>موفقیت شما، افتخار ماست.</p>
              </div>
            </div>
            <div className="ref-testimonials">
              {testimonials.slice(0, 3).map((t) => (
                <article key={t.id}>
                  <span>"</span>
                  <Stars />
                  <p>{t.text}</p>
                  <div>
                    <b>{t.student_name}</b>
                    <small>زبان‌آموز آموزشگاه</small>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEWS */}
      {news.length > 0 && (
        <section id="news" className="ref-section">
          <div className="ref-section-head">
            <div>
              <small>تازه‌های آموزشگاه</small>
              <h2>آخرین <strong>اخبار</strong></h2>
              <p>از رویدادها و اطلاعیه‌های جدید باخبر باشید.</p>
            </div>
          </div>
          <div className="ref-news-grid">
            {news.map((n, i) => (
              <article key={n.id}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Icon name="news" />
                  <small style={{ color: 'var(--gold)' }}>۰{i + 1}</small>
                </div>
                <Stars />
                <small>اطلاعیه</small>
                <h3>{n.title}</h3>
                <p>{n.content}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* DOCUMENTS + FAQ */}
      {(documents.length > 0 || faqs.length > 0) && (
        <section className="ref-section ref-bottom-grid">
          {documents.length > 0 && (
            <div className="ref-panel">
              <div className="ref-section-head">
                <div>
                  <small>مرجع سریع</small>
                  <h2>مدارک و <strong>مستندات</strong></h2>
                </div>
              </div>
              {documents.map((d) => (
                <a key={d.id} href={docUrl(d.file_path)} target="_blank" rel="noreferrer" className="ref-document">
                  <Icon name="file" />
                  <b>{d.title}</b>
                  <Icon name="arrow" className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}

          {faqs.length > 0 && (
            <div className="ref-panel" id="faq">
              <div className="ref-section-head">
                <div>
                  <small>راهنمای شما</small>
                  <h2>سؤالات <strong>متداول</strong></h2>
                </div>
              </div>
              {faqs.map((f) => {
                const isOpen = openFaq === f.id
                return (
                  <div className={`ref-faq ${isOpen ? 'open' : ''}`} key={f.id}>
                    <button onClick={() => setOpenFaq(isOpen ? null : f.id)}>
                      <span>{f.question}</span>
                      <b>+</b>
                    </button>
                    {isOpen && <p>{f.answer}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* FINAL CTA */}
      <section className="ref-final-cta">
        <div>
          <small>شروع مسیر</small>
          <h2>آماده‌ای قدم بعدی رو برداری؟</h2>
          <p>دوره مناسب خودت رو پیدا کن و از همین امروز شروع کن.</p>
        </div>
        <Link to="/courses" className="ref-btn ref-btn-gold">
          شروع یادگیری <Icon name="arrow" className="w-4 h-4"/>
        </Link>
      </section>
    </main>
  )
      }
