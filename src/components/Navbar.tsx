import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useState } from 'react'

export default function Navbar() {
  const { session, profile } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 bg-bgsoft/90 backdrop-blur border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent2 text-lg">⚡</span>
          <span className="font-black text-lg">اسپارک</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-[#C4C7ED]">
          <Link to="/courses" className="hover:text-accent transition-colors">دوره‌ها</Link>
          <Link to="/#news" className="hover:text-accent transition-colors">اخبار</Link>
          <Link to="/#faq" className="hover:text-accent transition-colors">سؤالات متداول</Link>
          <Link to="/contact" className="hover:text-accent transition-colors">تماس با ما</Link>
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link
                to={profile?.role === 'admin' ? '/admin' : '/dashboard'}
                className="text-sm bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-lg transition-colors"
              >
                {profile?.role === 'admin' ? 'پنل مدیریت' : 'پنل من'}
              </Link>
              <button onClick={logout} className="text-sm text-[#A8ACD9] hover:text-accent px-2 py-2 transition-colors">
                خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-[#A8ACD9] hover:text-accent px-2 py-2 transition-colors">ورود</Link>
              <Link to="/signup" className="btn-primary text-sm !py-2 !px-4">ثبت‌نام</Link>
            </>
          )}
          <button className="md:hidden w-9 h-9 grid place-items-center rounded-lg bg-white/5" onClick={() => setOpen(!open)}>☰</button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden flex flex-col gap-1 px-4 pb-4 text-sm text-[#C4C7ED]">
          <Link to="/courses" onClick={() => setOpen(false)} className="py-2">دوره‌ها</Link>
          <Link to="/#news" onClick={() => setOpen(false)} className="py-2">اخبار</Link>
          <Link to="/#faq" onClick={() => setOpen(false)} className="py-2">سؤالات متداول</Link>
          <Link to="/contact" onClick={() => setOpen(false)} className="py-2">تماس با ما</Link>
        </nav>
      )}
    </header>
  )
                }
