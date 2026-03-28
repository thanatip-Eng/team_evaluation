import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user is authorized (exists in students table)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        const { data: student } = await supabase
          .from('students')
          .select('id, role')
          .eq('email', user.email)
          .single();

        if (!student) {
          // Not authorized - sign out and redirect
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/?error=unauthorized`
          );
        }

        // Redirect admin to admin panel
        if (student.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
