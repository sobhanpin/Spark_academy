import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Footer() {
  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    supabase.from('site_settings').select('key,value').then(({ data }) => {
      if (data) setSettings(Object.fromEntries(data.map((d) => [d.key, d.value])))
    })
  }, [])

  return (
    <footer className="relative mt-20 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(91,50,196,0.2), transparent)' }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div
          className="relative rounded-3xl px-6 sm:px-10 py-8 sm:py-10 text-sm text-[#8B8FC0]"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))',
            border: '1px solid rgba(180,150,255,0.15)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 30px 60px -20px rgba(0,0,0,0.6), 0 0 40px -12px var(--glow-violet)',
          }}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accent2 text-sm shadow-glow-gold">⚡</span>
              <div>
                <div className="font-black text-white">{settings.site_name || 'توسعه‌کاران ستایش'}</div>
                <div className="text-[#5C5F8A] text-xs">{settings.tagline || 'جرقه‌ی شروع یادگیری'}</div>
              </div>
            </div>

            <div className="flex gap-2">
              {settings.telegram && (
                <a href={settings.telegram} target="_blank" rel="noreferrer" className="w-9 h-9 grid place-items-center rounded-full transition-transform duration-300 hover:-translate-y-0.5" style={{ background: 'rgba(255,255,255,0.06)', boxShadow: 'var(--shadow-neumo-out)' }}>✈️</a>
              )}
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 grid place-items-center rounded-full transition-transform duration-300 hover:-translate-y-0.5" style={{ background: 'rgba(255,255,255,0.06)', boxShadow: 'var(--shadow-neumo-out)' }}>📷</a>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-7">
            {settings.address && (
              <div className="flex items-center gap-2 rounded-btn px-3.5 py-2.5" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'var(--shadow-neumo-out)' }}>
                <span className="text-accent">📍</span><span>{settings.address}</span>
              </div>
            )}
            {settings.phone && (
              <div className="flex items-center gap-2 rounded-btn px-3.5 py-2.5" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'var(--shadow-neumo-out)' }}>
                <span className="text-accent">📞</span><span dir="ltr">{settings.phone}</span>
              </div>
            )}
            {settings.instagram && (
              <div className="flex items-center gap-2 rounded-btn px-3.5 py-2.5" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'var(--shadow-neumo-out)' }}>
                <span className="text-accent">📷</span><span>{settings.instagram}</span>
              </div>
            )}
            {settings.telegram && (
              <div className="flex items-center gap-2 rounded-btn px-3.5 py-2.5" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'var(--shadow-neumo-out)' }}>
                <span className="text-accent">✈️</span><span>{settings.telegram}</span>
              </div>
            )}
          </div>

          <div className="mt-7 pt-5 text-center text-[#5C5F8A]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {settings.copyright_text || '© تمامی حقوق برای آموزشگاه توسعه‌کاران ستایش محفوظ است.'}
          </div>
        </div>
      </div>
    </footer>
  )
          }
