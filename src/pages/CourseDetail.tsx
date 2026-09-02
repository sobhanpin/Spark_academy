import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, Course } from '../lib/supabase'

export default function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState<Course | null>(null)

  useEffect(() => {
    if (id) supabase.from('courses').select('*').eq('id', id).single().then(({ data }) => setCourse(data))
  }, [id])

  if (!course) return <div className="text-center py-24 text-[#8B8FC0]">در حال بارگذاری...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <span className="text-xs text-accent font-bold">{course.category}</span>
      <h1 className="text-3xl font-black mt-1 mb-4">{course.title}</h1>

      <div className="card mb-4">
        <p className="text-[#C4C7ED] leading-7">{course.description}</p>
        {course.workshop_details && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-sm font-bold text-accent mb-1">🛠 کارگاه عملی</div>
            <p className="text-sm text-[#8B8FC0]">{course.workshop_details}</p>
          </div>
        )}
        {course.required_documents && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-sm font-bold text-accent mb-1">📄 مدارک موردنیاز</div>
            <p className="text-sm text-[#8B8FC0]">{course.required_documents}</p>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <div className="card !py-3 text-sm flex justify-between"><span className="text-[#7B7FB5]">شهریه</span><span className="font-bold text-accent">{course.price.toLocaleString('fa-IR')} تومان</span></div>
        <div className="card !py-3 text-sm flex justify-between"><span className="text-[#7B7FB5]">نوع کلاس</span><span>{course.mode === 'both' ? 'حضوری و آنلاین' : course.mode === 'in_person' ? 'حضوری' : 'آنلاین'}</span></div>
        {course.duration && <div className="card !py-3 text-sm flex justify-between"><span className="text-[#7B7FB5]">مدت دوره</span><span>{course.duration}</span></div>}
        {course.prerequisite && <div className="card !py-3 text-sm flex justify-between"><span className="text-[#7B7FB5]">پیش‌نیاز</span><span>{course.prerequisite}</span></div>}
      </div>

      <Link to={`/courses/${course.id}/enroll`} className="btn-primary block text-center">ثبت‌نام در این دوره</Link>
    </div>
  )
        }
