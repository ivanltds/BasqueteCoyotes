import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/admin-auth'
import GalleriesManager from './GalleriesManager'

export default async function AdminGalleriesPage() {
  if (!(await isAuthenticated())) redirect('/admin/login')
  return <GalleriesManager />
}
