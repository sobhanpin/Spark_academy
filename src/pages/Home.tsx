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

        {/* 3D SCENE — Premium 3D Educational Composition */}
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

              {/* extra materials for the composition */}
              <linearGradient id="spineDark" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#040d1f" />
                <stop offset="1" stopColor="#0e2c56" />
              </linearGradient>
              <linearGradient id="coverEdgeLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity=".55" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="pagesShade" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff8e8" />
                <stop offset="1" stopColor="#d8b76c" />
              </linearGradient>
              <linearGradient id="ribbonGold" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fff0c0" />
                <stop offset="1" stopColor="#e08a1c" />
              </linearGradient>
              <linearGradient id="pencilWood" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#f6d9a0" />
                <stop offset="1" stopColor="#c98a3f" />
              </linearGradient>
              <linearGradient id="pencilBodyTop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffe9ad" />
                <stop offset="1" stopColor="#ffc94d" />
              </linearGradient>
              <linearGradient id="pencilBodyFront" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#e69a18" />
                <stop offset="1" stopColor="#a5620a" />
              </linearGradient>
              <linearGradient id="ferruleMetal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f3d9a3" />
                <stop offset=".5" stopColor="#c99a4c" />
                <stop offset="1" stopColor="#8a611f" />
              </linearGradient>
              <linearGradient id="eraserPink" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffb3c6" />
                <stop offset="1" stopColor="#e0577e" />
              </linearGradient>
              <linearGradient id="capTop" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2c66ab" />
                <stop offset=".55" stopColor="#153f78" />
                <stop offset="1" stopColor="#081d3d" />
              </linearGradient>
              <radialGradient id="capHead" cx="35%" cy="30%" r="75%">
                <stop offset="0" stopColor="#1f4f8e" />
                <stop offset="1" stopColor="#061a37" />
              </radialGradient>
              <linearGradient id="certPaper" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fffdf6" />
                <stop offset="1" stopColor="#efe4c4" />
              </linearGradient>
              <linearGradient id="sheenDiag" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
                <stop offset=".48" stopColor="#ffffff" stopOpacity=".35" />
                <stop offset=".56" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="keyLightWash" cx="50%" cy="38%" r="60%">
                <stop offset="0" stopColor="#bfe4ff" stopOpacity=".22" />
                <stop offset=".6" stopColor="#3f8fe0" stopOpacity=".07" />
                <stop offset="1" stopColor="#3f8fe0" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="sphereGlow" cx="38%" cy="32%" r="65%">
                <stop offset="0" stopColor="#e9f6ff" stopOpacity=".95" />
                <stop offset=".4" stopColor="#5cc0ff" stopOpacity=".55" />
                <stop offset="1" stopColor="#1670c9" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="platformGlass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#1c4d86" stopOpacity=".55" />
                <stop offset="1" stopColor="#04122a" stopOpacity=".75" />
              </linearGradient>
            </defs>

            {/* ---- soft key light wash unifying the whole scene ---- */}
            <ellipse cx="320" cy="255" rx="300" ry="230" fill="url(#keyLightWash)" />

            {/* ---- background: faint floating educational elements (behind everything) ---- */}
            <g className="hs-cube" opacity=".38">
              <polygon points="546,88 578,102 578,138 546,124" fill="none" stroke="#4fb2ff" strokeWidth="1.2" />
              <polygon points="546,88 570,78 602,92 578,102" fill="none" stroke="#4fb2ff" strokeWidth="1.2" />
              <polygon points="578,102 602,92 602,128 578,138" fill="none" stroke="#4fb2ff" strokeWidth="1.2" />
            </g>
            <circle className="hs-sphere" cx="94" cy="118" r="13" fill="url(#sphereGlow)" />
            <circle className="hs-sphere" cx="560" cy="330" r="7" fill="url(#sphereGlow)" style={{ animationDelay: '-3s' }} />
            <g className="hs-particle" style={{ animationDelay: '-2.4s' }}>
              <circle cx="500" cy="150" r="2.2" fill="#ffdf9e" opacity=".8" />
            </g>

            {/* ---- glowing glass platform ---- */}
            <ellipse className="hs-platform" cx="320" cy="565" rx="235" ry="58" fill="url(#platformGlow)" />
            <ellipse cx="320" cy="565" rx="185" ry="44" fill="url(#platformGlass)" stroke="#2e9cff" strokeWidth="1" opacity=".8" />
            <ellipse cx="320" cy="565" rx="150" ry="34" fill="none" stroke="#2e9cff" strokeWidth="2" opacity=".55" />
            <ellipse cx="320" cy="552" rx="95" ry="14" fill="url(#coverEdgeLight)" opacity=".25" />
            <ellipse cx="320" cy="565" rx="150" ry="34" fill="none" stroke="url(#ribbonGold)" strokeWidth="1" opacity=".3" />

            {/* ---- light rings ---- */}
            <g className="hs-ring">
              <ellipse cx="320" cy="430" rx="215" ry="68" fill="none" stroke="#2e9cff" strokeWidth="5" strokeDasharray="3 16" opacity=".45" />
            </g>
            <g className="hs-ring hs-ring-2">
              <ellipse cx="320" cy="448" rx="152" ry="46" fill="none" stroke="#ffc94d" strokeWidth="3" strokeDasharray="2 12" opacity=".5" />
            </g>
            <g className="hs-ring hs-ring-3">
              <ellipse cx="320" cy="410" rx="270" ry="86" fill="none" stroke="#2e9cff" strokeWidth="2" strokeDasharray="1 22" opacity=".22" />
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

            {/* ================= MAIN COMPOSITION ================= */}

            {/* 3D book stack — largest element, real spines, page-leaf texture, gold ribbon, cover typography */}
            <ellipse cx="305" cy="392" rx="195" ry="78" fill="url(#platformGlow)" opacity=".55" />
            <g transform="translate(305,375) scale(1.95) translate(-305,-375)" filter="url(#softShadow)">
              <g className="hs-books">

                {/* ===== bottom book (navy) — "LEARN" ===== */}
                <polygon points="150,366 150,428 172,436 172,374" fill="url(#spineDark)" />
                <rect x="172" y="374" width="208" height="34" fill="url(#coverNavy)" />
                <rect x="172" y="374" width="208" height="8" fill="url(#coverEdgeLight)" opacity=".5" />
                <polygon points="172,374 380,374 460,340 252,340" fill="url(#coverNavy)" />
                <polygon points="380,374 460,340 460,366 380,400" fill="url(#pagesShade)" />
                {[0,1,2,3,4,5].map(i => (
                  <line key={`p1-${i}`} x1={386 + i * 12} y1={374 - i * 0.4} x2={386 + i * 12 - 1} y2={399 - i * 0.4}
                    stroke="#b9924f" strokeWidth="1" opacity=".55" />
                ))}
                <line x1="380" y1="374" x2="460" y2="340" stroke="url(#ribbonGold)" strokeWidth="2.5" opacity=".9" />
                <polygon points="410,362 417,359 421,404 414,414 407,404" fill="url(#ribbonGold)" opacity=".92" />
                <text x="276" y="396" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff2cf" opacity=".55" style={{ letterSpacing: '2.5px' }}>LEARN</text>

                {/* ===== middle book (blue) — "GROW" ===== */}
                <polygon points="184,340 184,374 204,381 204,347" fill="url(#spineDark)" />
                <rect x="204" y="347" width="172" height="27" fill="url(#coverBlue)" />
                <rect x="204" y="347" width="172" height="6" fill="url(#coverEdgeLight)" opacity=".5" />
                <polygon points="204,347 364,347 432,318 272,318" fill="url(#coverBlue)" />
                <polygon points="364,347 432,318 432,340 364,366" fill="url(#pagesShade)" />
                {[0,1,2,3,4].map(i => (
                  <line key={`p2-${i}`} x1={370 + i * 12} y1={347 - i * 0.4} x2={370 + i * 12 - 1} y2={365 - i * 0.4}
                    stroke="#b9924f" strokeWidth="1" opacity=".5" />
                ))}
                <line x1="364" y1="347" x2="432" y2="318" stroke="url(#ribbonGold)" strokeWidth="2" opacity=".85" />
                <text x="290" y="365" textAnchor="middle" fontSize="9" fontWeight="700" fill="#eef8ff" opacity=".5" style={{ letterSpacing: '2.5px' }}>GROW</text>

                {/* ===== top book (gold-navy) — "SUCCEED" ===== */}
                <polygon points="212,318 212,347 230,353 230,324" fill="url(#spineDark)" />
                <rect x="230" y="324" width="118" height="23" fill="url(#coverGold)" />
                <rect x="230" y="324" width="118" height="5" fill="url(#coverEdgeLight)" opacity=".55" />
                <polygon points="230,324 340,324 392,302 282,302" fill="url(#coverGold)" />
                <polygon points="340,324 392,302 392,320 340,342" fill="url(#pagesShade)" />
                {[0,1,2,3].map(i => (
                  <line key={`p3-${i}`} x1={346 + i * 11} y1={324 - i * 0.4} x2={346 + i * 11 - 1} y2={340 - i * 0.4}
                    stroke="#b9924f" strokeWidth="1" opacity=".5" />
                ))}
                <line x1="340" y1="324" x2="392" y2="302" stroke="url(#ribbonGold)" strokeWidth="2.5" />
                <text x="289" y="339" textAnchor="middle" fontSize="7.2" fontWeight="700" fill="#fff2cf" opacity=".6" style={{ letterSpacing: '1.6px' }}>SUCCEED</text>

                <polygon points="150,428 460,320 460,340 170,436" fill="url(#sheenDiag)" />
              </g>
            </g>

            {/* graduation cap — sits on top of the stack */}
            <g transform="translate(330,240) scale(1.4) translate(-330,-240)" filter="url(#softShadow)">
              <g className="hs-cap">
                <ellipse cx="330" cy="236" rx="35" ry="16" fill="url(#capHead)" />
                <ellipse cx="330" cy="232" rx="35" ry="16" fill="url(#coverNavy)" opacity=".9" />
                <path d="M300,228 a34,13 0 0 1 34,-9" fill="none" stroke="#5cc7ff" strokeWidth="1.4" opacity=".4" />

                <polygon points="258,224 330,260 330,268 258,232" fill="url(#spineDark)" />
                <polygon points="330,260 402,224 402,232 330,268" fill="#081d3d" opacity=".85" />

                <polygon points="330,186 402,224 330,262 258,224" fill="url(#capTop)" stroke="#4fb2ff" strokeWidth="1.5" opacity=".97" />
                <polygon points="330,186 366,205 330,224 294,205" fill="url(#coverEdgeLight)" opacity=".55" />
                <line x1="330" y1="186" x2="330" y2="262" stroke="#0a2b57" strokeWidth="1" opacity=".4" />
                <line x1="258" y1="224" x2="402" y2="224" stroke="#0a2b57" strokeWidth="1" opacity=".3" />

                <circle cx="330" cy="224" r="7.5" fill="url(#goldMetal)" stroke="#8a611f" strokeWidth=".6" />
                <path d="M330,224 Q356,248 356,270" fill="none" stroke="url(#ribbonGold)" strokeWidth="3" strokeLinecap="round" />
                <path d="M330,224 Q356,248 356,270" fill="none" stroke="#fff0c0" strokeWidth="1" strokeLinecap="round" opacity=".6" />
                <circle cx="356" cy="271" r="4" fill="url(#goldMetal)" stroke="#8a611f" strokeWidth=".6" />
                <g stroke="url(#ribbonGold)" strokeWidth="2" strokeLinecap="round">
                  <line x1="356" y1="275" x2="347" y2="294" />
                  <line x1="356" y1="275" x2="353" y2="297" />
                  <line x1="356" y1="275" x2="359" y2="298" />
                  <line x1="356" y1="275" x2="365" y2="295" />
                  <line x1="356" y1="275" x2="361" y2="292" opacity=".7" />
                </g>
              </g>
            </g>

            {/* certificate — beside the stack, tilted toward the viewer */}
            <g transform="translate(500,365) rotate(-9) scale(1.3) translate(-462,-320)" filter="url(#softShadow)">
              <g className="hs-cert">
                <rect x="397" y="267" width="140" height="102" rx="4" fill="#d8bf85" opacity=".8" />
                <rect x="394" y="264" width="140" height="102" rx="4" fill="#e9d6a2" opacity=".9" />
                <rect x="392" y="262" width="140" height="102" rx="5" fill="url(#goldMetal)" />
                <rect x="396.5" y="266.5" width="131" height="93" rx="3.5" fill="none" stroke="#0d3868" strokeWidth=".8" opacity=".35" />
                <rect x="400" y="270" width="124" height="86" rx="3" fill="url(#certPaper)" />
                <text x="462" y="288" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#0d3868" style={{ letterSpacing: '1.5px' }}>CERTIFICATE</text>
                <line x1="428" y1="293" x2="496" y2="293" stroke="#c9a15c" strokeWidth="1" opacity=".7" />
                <rect x="415" y="300" width="94" height="2.6" fill="#c9cfd8" />
                <rect x="425" y="308" width="74" height="2.6" fill="#c9cfd8" />
                <rect x="418" y="316" width="88" height="2.2" fill="#dbdfe4" />
                <path d="M454,347 L458,368 L462,352 Z" fill="#0a2c56" />
                <path d="M470,347 L466,368 L462,352 Z" fill="#0d3868" />
                <circle cx="462" cy="336" r="13.5" fill="url(#goldMetal)" stroke="#0d3868" strokeWidth="1.5" />
                <circle cx="462" cy="336" r="9.5" fill="none" stroke="#8a611f" strokeWidth=".6" opacity=".6" />
                <path d="m457,336 3,4 7,-8" fill="none" stroke="#0d3868" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M400,356 L400,344 L412,356 Z" fill="#dcc98a" opacity=".8" />
                <polygon points="400,270 460,270 424,356 400,356" fill="url(#sheenDiag)" opacity=".8" />
              </g>
            </g>

            {/* scroll — small complementary element near the base of the stack */}
            <g transform="translate(275,478) scale(1.25) translate(-255,-470)" filter="url(#softShadow)">
              <g className="hs-scroll">
                <ellipse cx="207" cy="470" rx="13" ry="17" fill="url(#goldMetal)" />
                <ellipse cx="207" cy="470" rx="7" ry="11" fill="#0d3868" opacity=".5" />
                <rect x="207" y="453" width="96" height="34" fill="url(#certPaper)" />
                <ellipse cx="303" cy="470" rx="13" ry="17" fill="url(#goldMetal)" />
                <ellipse cx="303" cy="470" rx="7" ry="11" fill="#0d3868" opacity=".5" />
                <rect x="207" y="453" width="96" height="6" fill="url(#coverEdgeLight)" opacity=".45" />
                <rect x="238" y="447" width="12" height="46" fill="url(#ribbonGold)" opacity=".9" transform="rotate(18 244 470)" />
              </g>
            </g>

            {/* pencil — smaller than the books, diagonal in the foreground */}
            <ellipse cx="159" cy="507" rx="78" ry="42" fill="url(#platformGlow)" opacity=".45" />
<ellipse cx="180" cy="500" rx="50" ry="28" fill="url(#goldGlow)" opacity=".4" />
<g transform="translate(159,507) scale(1.55) translate(-159,-437)" filter="url(#softShadow)">
              <g transform="rotate(-28 150 437)">
                <g className="hs-pencil">
                  <polygon points="122,427 214,427 214,437 122,437" fill="url(#pencilBodyTop)" />
                  <polygon points="122,437 214,437 214,446 122,446" fill="url(#pencilBodyFront)" />
                  <line x1="122" y1="437" x2="214" y2="437" stroke="#fff0c0" strokeWidth="1" opacity=".65" />
                  <line x1="122" y1="427" x2="214" y2="427" stroke="#8a611f" strokeWidth="1" opacity=".4" />

                  <polygon points="122,427 122,446 84,436.5" fill="url(#pencilWood)" />
                  <polygon points="122,427 122,436.5 84,436.5" fill="#fbe6bd" opacity=".55" />
                  <polygon points="84,436.5 100,433.5 100,439.5" fill="#3a2a17" />
                  <polygon points="84,436.5 92,435 92,438" fill="#161010" />

                  <rect x="214" y="427" width="12" height="19" fill="url(#ferruleMetal)" />
                  <line x1="218" y1="427" x2="218" y2="446" stroke="#8a611f" strokeWidth=".8" opacity=".6" />
                  <line x1="222" y1="427" x2="222" y2="446" stroke="#8a611f" strokeWidth=".8" opacity=".6" />

                  <rect x="226" y="427" width="20" height="19" rx="4.5" fill="url(#eraserPink)" />
                  <ellipse cx="234" cy="432" rx="6" ry="2.4" fill="#ffe3ea" opacity=".6" />
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
