'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Student } from '@/lib/types';

interface NavbarProps {
  student: Student;
}

export default function Navbar({ student }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href={student.role === 'admin' ? '/admin' : '/dashboard'} className="font-bold text-lg">
            ระบบประเมินเพื่อนในกลุ่ม
          </Link>

          <div className="flex items-center gap-4">
            {student.role === 'admin' && (
              <Link
                href="/admin"
                className="text-white/90 hover:text-white text-sm"
              >
                Admin
              </Link>
            )}
            <span className="text-sm text-white/80">
              {student.name}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-white/20 rounded hover:bg-white/30 text-sm transition"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
