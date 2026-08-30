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
    <footer className="border-t border-white/10 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10 text-sm text-[#8B8FC0]">
        <div className="flex items-center gap-2 mb-3">
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent2 text-sm">⚡</span>
          <span className="font-black text-white">{settings.site_name || 'اسپارک'}</span>
          <span className="text-[#5C5F8A]">| {settings.tagline || 'جرقه‌ی شروع یادگیری'}</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          {settings.address && <div>📍 {settings.address}</div>}
          {settings.phone && <div>📞 {settings.phone}</div>}
          {settings.instagram && <div>📷 {settings.instagram}</div>}
        </div>
        <div className="mt-6 text-[#5C5F8A]">© تمامی حقوق برای آموزشگاه اسپارک محفوظ است.</div>
      </div>
    </footer>
  )
}
