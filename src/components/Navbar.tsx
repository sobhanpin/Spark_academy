import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useState } from 'react'
import LiveClock from './LiveClock'

const mobileLinks = [
  {
    to: '/courses',
    label: 'دوره‌ها',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/#news',
    label: 'اخبار',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10M7 12h10M7 16h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/#faq',
    label: 'سؤالات متداول',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.3 2.4c-.8.3-1.3 1-1.3 1.9" strokeLinecap="round" />
        <circle cx="12" cy="17" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/contact',
    label: 'تماس با ما',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5h16v14H4z" strokeLinejoin="round" />
        <path d="m4 6 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function Navbar() {
  const { session, profile } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const panelPath = profile?.role === 'admin' ? '/admin' : profile?.role === 'teacher' ? '/teacher' : '/dashboard'
  const panelLabel = profile?.role === 'admin' ? 'پنل مدیریت' : profile?.role === 'teacher' ? 'پنل مدرس' : 'پنل من'

  return (
    <header
      className="sticky top-0 z-30"
      style={{
        background: 'linear-gradient(180deg, rgba(23,20,61,0.92), rgba(13,11,38,0.92))',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(180,150,255,0.12)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
      }}
    >
      {/* Row 1 — logo / nav links / auth / hamburger */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group perspective-1000">
          <span
            className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent2 text-lg shadow-glow-gold transition-transform duration-500 ease-smooth-3d group-hover:-translate-y-0.5 group-hover:rotate-[8deg]"
          >
            ⚡
          </span>
          <span className="font-black text-lg tracking-tight">توسعه‌کاران ستایش</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 text-sm text-[#C4C7ED]">
          <Link to="/" className="relative py-1 hover:text-accent transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full">خانه</Link>
          <Link to="/courses" className="relative py-1 hover:text-accent transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full">دوره‌ها</Link>
          <Link to="/#news" className="relative py-1 hover:text-accent transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full">اخبار</Link>
          <Link to="/#faq" className="relative py-1 hover:text-accent transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full">سؤالات متداول</Link>
          <Link to="/contact" className="relative py-1 hover:text-accent transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full">تماس با ما</Link>
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link
                to={panelPath}
                className="hidden sm:inline-block text-sm px-3.5 py-2 rounded-btn transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.06)', boxShadow: 'var(--shadow-neumo-out)' }}
              >
                {panelLabel}
              </Link>
              <button
                onClick={logout}
                className="text-sm text-[#A8ACD9] hover:text-accent px-2 py-2 transition-colors duration-300"
              >
                خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-[#A8ACD9] hover:text-accent px-2 py-2 transition-colors duration-300">ورود</Link>
              <Link
                to="/signup"
                className="text-sm font-bold px-5 py-2 rounded-btn text-bg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #FFC168, #FF7A3D)',
                  boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset, 0 8px 18px -6px rgba(255,122,61,0.5), 0 0 16px -4px var(--glow-gold)',
                }}
              >
                ثبت‌نام
              </Link>
            </>
          )}

          <button
            className="lg:hidden w-9 h-9 grid place-items-center rounded-btn transition-all duration-300"
            style={{ background: 'rgba(255,255,255,0.06)', boxShadow: 'var(--shadow-neumo-out)' }}
            onClick={() => setOpen(!open)}
            aria-label="باز کردن منو"
          >
            <span className="text-lg">{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Row 2 — live date/time bar, always visible */}
      <div className="flex justify-center pb-2.5 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="pt-2">
          <LiveClock />
        </div>
      </div>

      {open && (
        <nav className="lg:hidden flex flex-col gap-1.5 px-4 pb-4 text-sm text-[#C4C7ED] animate-fade-up">
          {mobileLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-btn px-4 py-2.5 hover:text-accent hover:-translate-y-0.5 transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-accent">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          {session && (
            <Link to={panelPath} onClick={() => setOpen(false)} className="sm:hidden flex items-center gap-3 rounded-btn px-4 py-2.5 hover:text-accent transition-all duration-300" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {panelLabel}
            </Link>
          )}
        </nav>
      )}
    </header>
  )
          }
