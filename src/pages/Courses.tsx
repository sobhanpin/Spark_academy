import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, Course } from '../lib/supabase'

const categories = ['همه', 'زبان', 'کنکور', 'فنی']

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [category, setCategory] = useState('همه')
  const [mode, setMode] = useState('همه')
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('courses').select('*').eq('is_active', true).order('created_at').then(({ data }) => setCourses(data || []))
  }, [])

  const filtered = courses.filter((c) => {
    if (category !== 'همه' && c.category !== category) return false
    if (mode === 'حضوری' && c.mode === 'online') return false
    if (mode === 'آنلاین' && c.mode === 'in_person') return false
    if (search && !c.title.includes(search) && !c.description.includes(search)) return false
    return true
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black mb-6">همه دوره‌ها</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === cat ? 'bg-accent text-bg' : 'bg-white/5 text-[#A8ACD9]'
            }`}
          >
            {cat}
          </button>
        ))}
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="input !w-auto text-sm">
          <option>همه</option>
          <option>حضوری</option>
          <option>آنلاین</option>
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جست‌وجوی دوره..."
          className="input !w-auto flex-1 min-w-[160px] text-sm"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Link key={c.id} to={`/courses/${c.id}`} className="card hover:border-accent/40 hover:-translate-y-1 transition-all block">
            <span className="text-xs text-accent font-bold">{c.category}</span>
            <h3 className="font-bold mt-1 mb-2">{c.title}</h3>
            <p className="text-sm text-[#8B8FC0] line-clamp-2">{c.description}</p>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-accent">{c.price.toLocaleString('fa-IR')} تومان</span>
              <span className="text-[11px] text-[#7B7FB5]">{c.mode === 'both' ? 'حضوری و آنلاین' : c.mode === 'in_person' ? 'حضوری' : 'آنلاین'}</span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && <div className="text-[#5C5F8A] col-span-full text-center py-10">دوره‌ای با این مشخصات پیدا نشد.</div>}
      </div>
    </div>
  )
}
