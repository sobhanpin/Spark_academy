import { useEffect, useState } from 'react'

const faDigits = (n: number | string) =>
  String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])

const weekdayMap: Record<string, string> = {
  Sun: 'یکشنبه',
  Mon: 'دوشنبه',
  Tue: 'سه‌شنبه',
  Wed: 'چهارشنبه',
  Thu: 'پنجشنبه',
  Fri: 'جمعه',
  Sat: 'شنبه',
}

const jalaliMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

function toJalali(gy: number, gm: number, gd: number) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  let jy = gy <= 1600 ? 0 : 979
  gy -= gy <= 1600 ? 621 : 1600
  const gy2 = gm > 2 ? gy + 1 : gy
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1]
  jy += 33 * Math.floor(days / 12053)
  days %= 12053
  jy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) {
    jy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30)
  const jd = days < 186 ? 1 + (days % 31) : 1 + ((days - 186) % 30)
  return { jy, jm, jd }
}

function getTehranParts() {
  const now = new Date()
  const dateFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  })
  const timeFmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const dParts = dateFmt.formatToParts(now)
  const get = (type: string) => dParts.find((p) => p.type === type)?.value ?? ''
  const gy = Number(get('year'))
  const gm = Number(get('month'))
  const gd = Number(get('day'))
  const weekdayEn = get('weekday')

  const { jy, jm, jd } = toJalali(gy, gm, gd)
  const time = timeFmt.format(now)

  return {
    weekday: weekdayMap[weekdayEn] ?? '',
    jalaliDate: `${faDigits(jd)} ${jalaliMonths[jm - 1]} ${faDigits(jy)}`,
    time: faDigits(time),
  }
}

export default function LiveClock({ compact = false }: { compact?: boolean }) {
  const [parts, setParts] = useState(getTehranParts)

  useEffect(() => {
    const id = setInterval(() => setParts(getTehranParts()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="relative inline-flex items-center gap-2 rounded-pill px-4 py-1.5 text-xs text-[#D8DAF4] select-none whitespace-nowrap"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
        border: '1px solid rgba(180,150,255,0.22)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 10px 24px -10px rgba(139,92,246,0.5), 0 0 16px -4px var(--glow-violet)',
      }}
    >
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
      </svg>
      {!compact && (
        <>
          <span className="font-medium">{parts.weekday}</span>
          <span className="opacity-30">|</span>
          <span>{parts.jalaliDate}</span>
          <span className="opacity-30">|</span>
        </>
      )}
      <span className="font-mono tabular-nums text-accent font-bold">{parts.time}</span>
    </div>
  )
    }
