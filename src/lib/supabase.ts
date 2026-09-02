import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

export type Profile = {
  id: string
  name: string
  phone: string | null
  role: 'student' | 'admin'
  avatar_url: string | null
  created_at: string
}

export type Course = {
  id: string
  title: string
  category: 'زبان' | 'کنکور' | 'فنی'
  description: string
  workshop_details: string | null
  price: number
  mode: 'in_person' | 'online' | 'both'
  schedule: string | null
  capacity: number | null
  duration: string | null
  prerequisite: string | null
  required_documents: string | null
  image_url: string | null
  video_url: string | null
  is_active: boolean
  created_at: string
}

export type Enrollment = {
  id: string
  user_id: string
  course_id: string
  class_mode: 'in_person' | 'online'
  payment_status: 'pending' | 'paid'
  completed: boolean
  certificate_issued: boolean
  enrolled_at: string
  confirmed_at: string | null
  courses?: Course
  profiles?: Profile
}

export type Upload = {
  id: string
  user_id: string
  course_id: string | null
  file_name: s
