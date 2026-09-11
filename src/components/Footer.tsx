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
    <footer className="relative mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="glass-panel rounded-3xl px-6 sm:px-10 py-8 sm:py-10 text-sm text-[#8B8FC0]">
          <div className="flex items-center gap-2 mb-5">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent2 text-sm shadow-glow-gold">⚡</span>
            <span className="font-black text-white">{settings.site_name || 'توسعه‌کاران ستایش'}</span>
            <span className="text-[#5C5F8A]">| {settings.tagline || 'جرقه‌ی شروع یادگیری'}</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {settings.address && (
              <div className="flex items-center gap-2 bg-white/5 rounded-btn px-3 py-2.5 shadow-neumo-out">
                <span className="w-6 h-6 shrink-0 grid place-items-center rounded-full bg-white/5 text-accent text-xs">📍</span>
                <span>{settings.address}</span>
              </div>
            )}
            {settings.phone && (
              <div className="flex items-center gap-2 bg-white/5 rounded-btn px-3 py-2.5 shadow-neumo-out">
                <span className="w-6 h-6 shrink-0 grid place-items-center rounded-full bg-white/5 text-accent text-xs">📞</span>
                <span dir="ltr">{settings.phone}</span>
              </div>
            )}
            {settings.instagram && (
              <div className="flex items-center gap-2 bg-white/5 rounded-btn px-3 py-2.5 shadow-neumo-out">
                <span className="w-6 h-6 shrink-0 grid place-items-center rounded-full bg-white/5 text-accent text-xs">📷</span>
                <span>{settings.instagram}</span>
              </div>
            )}
            {settings.telegram && (
              <div className="flex items-center gap-2 bg-white/5 rounded-btn px-3 py-2.5 shadow-neumo-out">
                <span className="w-6 h-6 shrink-0 grid place-items-center rounded-full bg-white/5 text-accent text-xs">✈️</span>
                <span>{settings.telegram}</span>
              </div>
            )}
          </div>

          <div className="mt-7 pt-5 border-t border-white/5 text-[#5C5F8A] text-center sm:text-right">
            {settings.copyright_text || '© تمامی حقوق برای آموزشگاه توسعه‌کاران ستایش محفوظ است.'}
          </div>
        </div>
      </div>
    </footer>
  )
                  }
