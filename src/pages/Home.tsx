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
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
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

  const cardShadow = '0 24px 55px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.09), inset 0 -18px 35px rgba(0,0,0,.18)'

  return (
    <main className="relative overflow-hidden bg-[#090718]">
      <div className="home-orb home-orb-a" aria-hidden="true" />
      <div className="home-orb home-orb-b" aria-hidden="true" />
      <div className="home-grid" aria-hidden="true" />

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 sm:pt-10 pb-14 sm:pb-20">
        <div className="hero-shell relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] min-h-[600px] lg:min-h-[650px]">
          <div className="hero-noise" aria-hidden="true" />
          <div className="absolute -top-32 -left-20 w-80 h-80 rounded-full bg-violet/20 blur-3xl" />
          <div className="absolute -bottom-40 right-10 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative grid lg:grid-cols-[.92fr_1.08fr] min-h-[600px] lg:min-h-[650px] items-center p-6 sm:p-10 lg:p-14 gap-8">
            <div className="order-2 lg:order-1 text-center lg:text-right z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-chip text-accent text-xs font-bold mb-6">
                <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_14px_rgba(255,193,104,.9)]" />
                آموزشگاه توسعه‌کاران ستایش
              </div>

              <h1 className="text-[2.25rem] sm:text-5xl lg:text-[4.2rem] font-black leading-[1.18] tracking-tight max-w-2xl mx-auto lg:mr-0">
                <span className="hero-gradient-text">
                  {settings.hero_title || 'اسپارک باش، مسیرتو روشن کن'}
                </span>
              </h1>

              <p className="mt-6 max-w-xl mx-auto lg:mr-0 text-[#B9B8D8] leading-8 text-sm sm:text-base">
                {settings.hero_subtitle ||
                  'زبان، کنکور و مهارت‌های فنی؛ آموزش حرفه‌ای با مسیر روشن، استادهای باتجربه و تجربه‌ای مدرن برای رشد واقعی.'}
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 mt-8">
                <Link to="/courses" className="hero-primary-btn">
                  <span>مشاهده دوره‌ها</span>
                  <Icon name="arrow" className="w-5 h-5" />
                </Link>
                <Link to="/contact" className="hero-secondary-btn">
                  با ما در ارتباط باشید
                </Link>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-8 text-xs text-[#9B99BE]">
                <span className="mini-stat">
                  <Icon name="users" className="w-4 h-4 text-accent" />
                  آموزش برای همه
                </span>
                <span className="mini-stat">
                  <Icon name="clock" className="w-4 h-4 text-violetlight" />
                  حضوری و آنلاین
                </span>
                <span className="mini-stat">
                  <Icon name="star" className="w-4 h-4 text-accent" />
                  مسیر حرفه‌ای
                </span>
              </div>
            </div>

            {/* 3D EDUCATION VISUAL */}
            <div className="order-1 lg:order-2 relative h-[330px] sm:h-[390px] lg:h-[540px] perspective-1000" aria-hidden="true">
              <div className="hero-aura absolute inset-[8%] rounded-full" />

              <div className="float-card float-card-top">
                <div className="icon-tile purple">
                  <Icon name="book" />
                </div>
                <div>
                  <b>یادگیری</b>
                  <small>هر روز یک قدم</small>
                </div>
              </div>

              <div className="float-card float-card-side">
                <div className="icon-tile gold">
                  <Icon name="star" />
                </div>
                <div>
                  <b>مهارت جدید</b>
                  <small>شروع از همین امروز</small>
                </div>
              </div>

              <div className="certificate-card">
                <div className="cert-seal">★</div>
                <div>
                  <small>گواهی پایان دوره</small>
                  <strong>توسعه‌کاران ستایش</strong>
                </div>
              </div>

              <div className="education-stage">
                <div className="stage-glow" />
                <div className="book-stack book-one" />
                <div className="book-stack book-two" />
                <div className="book-stack book-three" />
                <div className="open-book">
                  <span />
                  <span />
                </div>
                <div className="cap">
                  <div className="cap-top" />
                  <div className="cap-body" />
                  <i />
                </div>
                <div className="stage-platform" />
              </div>

              <div className="hero-dot dot-one" />
              <div className="hero-dot dot-two" />
              <div className="hero-dot dot-three" />
            </div>
          </div>

          <div className="hero-bottom-line" />
        </div>
      </section>

      {/* COURSES */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="section-heading">
          <div>
            <span className="section-kicker">آموزش هدفمند</span>
            <h2>دوره‌های آموزشی</h2>
            <p>مهارتت رو به یک قدم واقعی نزدیک‌تر کن.</p>
          </div>
          <Link to="/courses" className="section-link hidden sm:inline-flex">
            مشاهده همه
            <Icon name="arrow" className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
          {courses.map((c, index) => (
            <Link key={c.id} to={`/courses/${c.id}`} className="course-3d-card group" style={{ boxShadow: cardShadow }}>
              <div className="course-image-wrap">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.title} className="course-image" />
                ) : (
                  <div className="course-placeholder">
                    <Icon name="book" className="w-12 h-12" />
                  </div>
                )}
                <span className="course-number">۰{index + 1}</span>
                <span className="course-category">{c.category}</span>
              </div>

              <div className="p-5">
                <h3 className="font-black text-base leading-7 mb-2">{c.title}</h3>
                <p className="text-xs text-[#9290B8] leading-6 line-clamp-2 min-h-12">{c.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-accent font-black text-sm">{c.price.toLocaleString('fa-IR')} تومان</span>
                  <span className="course-arrow">
                    <Icon name="arrow" className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-7 sm:hidden">
          <Link to="/courses" className="section-link inline-flex">
            مشاهده همه دوره‌ها
            <Icon name="arrow" className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="feature-panel">
            <div className="section-heading mb-8">
              <div>
                <span className="section-kicker">تجربه واقعی</span>
                <h2>نظر زبان‌آموزان</h2>
                <p>چیزی که بعد از یادگیری باقی می‌ماند، نتیجه است.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.slice(0, 3).map((t) => (
                <article key={t.id} className="testimonial-3d">
                  <div className="quote-mark">“</div>
                  <div className="flex gap-1 text-accent mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Icon key={i} name="star" className="w-3.5 h-3.5" />
                    ))}
                  </div>
                  <p className="text-sm leading-7 text-[#C2C1DD] min-h-[84px]">{t.text}</p>
                  <div className="mt-5 pt-4 border-t border-white/7 flex items-center gap-3">
                    <span className="avatar-3d">{t.student_name?.charAt(0)}</span>
                    <div>
                      <strong className="text-sm">{t.student_name}</strong>
                      <small className="block text-[#77769B] mt-0.5">زبان‌آموز آموزشگاه</small>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEWS */}
      {news.length > 0 && (
        <section id="news" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="section-heading">
            <div>
              <span className="section-kicker">تازه‌های آموزشگاه</span>
              <h2>آخرین اخبار</h2>
              <p>از رویدادها و اطلاعیه‌های جدید باخبر باشید.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {news.map((n, i) => (
              <article key={n.id} className="news-3d-card">
                <div className="news-top">
                  <span>۰{i + 1}</span>
                  <Icon name="news" className="w-5 h-5" />
                </div>
                <h3>{n.title}</h3>
                <p>{n.content}</p>
                <div className="news-line" />
              </article>
            ))}
          </div>
        </section>
      )}

      {/* DOCUMENTS + FAQ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-6 lg:gap-8">
          {documents.length > 0 && (
            <div className="feature-panel p-5 sm:p-7">
              <div className="section-heading mb-6">
                <div>
                  <span className="section-kicker">مرجع سریع</span>
                  <h2>مدارک و مستندات</h2>
                </div>
              </div>
              <div className="space-y-3">
                {documents.map((d) => (
                  <a key={d.id} href={docUrl(d.file_path)} target="_blank" rel="noreferrer" className="document-3d">
                    <span className="doc-icon">
                      <Icon name="file" />
                    </span>
                    <span className="flex-1 font-bold text-sm">{d.title}</span>
                    <Icon name="arrow" className="w-4 h-4 text-accent" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {faqs.length > 0 && (
            <div id="faq" className="feature-panel p-5 sm:p-7">
              <div className="section-heading mb-6">
                <div>
                  <span className="section-kicker">راهنمای شما</span>
                  <h2>سؤالات متداول</h2>
                </div>
              </div>
              <div className="space-y-3">
                {faqs.map((f) => {
                  const isOpen = openFaq === f.id
                  return (
                    <div key={f.id} className={`faq-3d ${isOpen ? 'faq-open' : ''}`}>
                      <button
                        className="w-full flex items-center justify-between gap-4 text-right p-4"
                        onClick={() => setOpenFaq(isOpen ? null : f.id)}
                      >
                        <span className="font-bold text-sm">{f.question}</span>
                        <span className="faq-plus">+</span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4">
                          <p className="faq-answer">{f.answer}</p>
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

      {/* FINAL CTA */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="cta-strip">
          <div>
            <span className="section-kicker">شروع مسیر</span>
            <h2>آماده‌ای قدم بعدی رو برداری؟</h2>
            <p>دوره مناسب خودت رو پیدا کن و از همین امروز شروع کن.</p>
          </div>
          <Link to="/courses" className="hero-primary-btn shrink-0">
            <span>شروع یادگیری</span>
            <Icon name="arrow" className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  )
                                                                                        }
