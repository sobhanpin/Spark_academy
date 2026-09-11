import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, Course } from '../lib/supabase'
import Spinner from '../components/Spinner'

export default function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('courses').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) setNotFound(true)
      else setCourse(data)
    })
  }, [id])

  if (notFound) {
    return (
      <div className="max-w-sm mx-auto px-4 py-24 text-center">
        <p className="text-[#8B8FC0] mb-4">این دوره پیدا نشد یا دیگر فعال نیست.</p>
        <Link
          to="/courses"
          className="btn-primary rounded-btn shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform duration-300"
        >
          مشاهده دوره‌های دیگر
        </Link>
      </div>
    )
  }

  if (!course) return <Spinner />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {course.image_url && (
        <img
          src={course.image_url}
          alt={course.title}
          className="w-full h-56 sm:h-72 object-cover rounded-3xl mb-5 shadow-soft-lg"
        />
      )}
      <span className="text-xs text-accent font-bold">{course.category}</span>
      <h1 className="text-3xl sm:text-4xl font-black mt-1 mb-5">{course.title}</h1>

      <div
        className="glass-panel rounded-card p-5 sm:p-6 mb-5"
        style={{ boxShadow: 'var(--shadow-glass)' }}
      >
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
        <div className="glass-panel rounded-btn p-3.5 text-sm flex justify-between">
          <span className="text-[#7B7FB5]">شهریه</span><span className="font-bold text-accent">{course.price.toLocaleString('fa-IR')} تومان</span>
        </div>
        <div className="glass-panel rounded-btn p-3.5 text-sm flex justify-between">
          <span className="text-[#7B7FB5]">نوع کلاس</span><span>{course.mode === 'both' ? 'حضوری و آنلاین' : course.mode === 'in_person' ? 'حضوری' : 'آنلاین'}</span>
        </div>
        {course.duration && (
          <div className="glass-panel rounded-btn p-3.5 text-sm flex justify-between">
            <span className="text-[#7B7FB5]">مدت دوره</span><span>{course.duration}</span>
          </div>
        )}
        {course.prerequisite && (
          <div className="glass-panel rounded-btn p-3.5 text-sm flex justify-between">
            <span className="text-[#7B7FB5]">پیش‌نیاز</span><span>{course.prerequisite}</span>
          </div>
        )}
      </div>

      <Link
        to={`/courses/${course.id}/enroll`}
        className="btn-primary block text-center sm:inline-block sm:px-10 rounded-btn shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-transform duration-300"
      >
        ثبت‌نام در این دوره
      </Link>
    </div>
  )
            }
