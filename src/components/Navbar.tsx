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
    <header className="sticky top-0 z-30 bg-bgsoft/80 backdrop-blur-xl border-b border-white/10 shadow-soft-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 grid grid-cols-2 md:grid-cols-3 items-center gap-3">
        <Link to="/" className="flex items-center gap-2 group perspective-1000">
          <span
            className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent2 text-lg shadow-glow-gold transition-transform duration-500 ease-smooth-3d group-hover:-translate-y-0.5 group-hover:rotate-[8deg]"
          >
            ⚡
          </span>
          <span className="font-black text-lg tracking-tight">توسعه‌کاران ستایش</span>
        </Link>

        <div className="hidden md:flex justify-center">
          <LiveClock />
        </div>

        <div className="flex items-center justify-end gap-2">
          <nav className="hidden lg:flex items-center gap-5 text-sm text-[#C4C7ED] ml-2">
            <Link to="/courses" className="relative py-1 hover:text-accent transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full">دوره‌ها</Link>
            <Link to="/#news" className="relative py-1 hover:text-accent transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full">اخبار</Link>
            <Link to="/#faq" className="relative py-1 hover:text-accent transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full">سؤالات متداول</Link>
            <Link to="/contact" className="relative py-1 hover:text-accent transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full">تماس با ما</Link>
          </nav>

          {session ? (
            <>
              <Link
                to={panelPath}
                className="hidden sm:inline-block text-sm bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-btn transition-all duration-300 shadow-neumo-out hover:-translate-y-0.5 active:translate-y-0 active:shadow-neumo-in"
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
              <Link to="/login" className="hidden sm:inline-block text-sm text-[#A8ACD9] hover:text-accent px-2 py-2 transition-colors duration-300">ورود</Link>
              <Link
                to="/signup"
                className="btn-primary text-sm !py-2 !px-4 shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-300"
              >
                ثبت‌نام
              </Link>
            </>
          )}

          <button
            className="md:hidden w-9 h-9 grid place-items-center rounded-btn bg-white/5 shadow-neumo-out active:shadow-neumo-in transition-all duration-300"
            onClick={() => setOpen(!open)}
            aria-label="باز کردن منو"
          >
            <span className="text-lg">{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      <div className="md:hidden flex justify-center pb-2 px-4">
        <LiveClock compact />
      </div>

      {open && (
        <nav className="md:hidden flex flex-col gap-1.5 px-4 pb-4 text-sm text-[#C4C7ED] animate-fade-up">
          {mobileLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="glass-panel flex items-center gap-3 rounded-btn px-4 py-2.5 hover:text-accent hover:-translate-y-0.5 transition-all duration-300"
            >
              <span className="text-accent">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
