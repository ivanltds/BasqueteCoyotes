import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/admin-auth'
import AdminShell from './AdminShell'

export default async function AdminPage() {
  if (!(await isAuthenticated())) redirect('/admin/login')
  return <AdminShell />
}
