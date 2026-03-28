import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EvaluationForm from '@/components/EvaluationForm';
import { Student } from '@/lib/types';

export default async function EvaluatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
  if (!student) redirect('/');

  const typedStudent = student as Student;

  // Get the person to evaluate
  const { data: evaluated } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single();

  if (!evaluated) redirect('/dashboard');

  // Check if already evaluated
  const { data: existing } = await supabase
    .from('evaluations')
    .select('id')
    .eq('evaluator_id', typedStudent.id)
    .eq('evaluated_id', id)
    .single();

  if (existing) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar student={typedStudent} />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <EvaluationForm
          evaluatorId={typedStudent.id}
          evaluatedId={id}
          evaluatedName={evaluated.name}
          evaluatedStudentId={evaluated.student_id}
        />
      </main>
    </div>
  );
}
