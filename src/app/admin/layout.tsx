import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AdminSidebar from '@/components/AdminSidebar';
import { Student } from '@/lib/types';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) redirect('/');

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('email', user.email)
    .single();

  if (!student || (student as Student).role !== 'admin') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar student={student as Student} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
