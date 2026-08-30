import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="text-center py-24 text-[#8B8FC0]">در حال بارگذاری...</div>
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth()
  if (loading) return <div className="text-center py-24 text-[#8B8FC0]">در حال بارگذاری...</div>
  if (!session) return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
