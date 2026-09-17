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

        {/* 3D SCENE — real rendered illustration (book stack, cap, certificate, scroll, pencil) */}
        <div className="ref-scene" aria-hidden="true">
          <img
            src={`${import.meta.env.BASE_URL}hero-scene.webp`}
            alt=""
            width="1000"
            height="1000"
            fetchPriority="high"
            loading="eager"
            className="hero-scene-img"
          />
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
