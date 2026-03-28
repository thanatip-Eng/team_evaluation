import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CompetencyBar from '@/components/CompetencyBar';
import Link from 'next/link';
import { Student, CompetencyAverages } from '@/lib/types';
import { filterInappropriate, generateSummary } from '@/lib/utils';

export default async function FeedbackPage() {
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

  // Count peers in group
  const { count: totalPeers } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('group_name', typedStudent.group_name)
    .neq('email', typedStudent.email);

  // Get evaluations received
  const { data: evaluations } = await supabase
    .from('evaluations')
    .select('*')
    .eq('evaluated_id', typedStudent.id);

  const evals = evaluations || [];
  const evaluatedCount = evals.length;

  let averages: CompetencyAverages | null = null;
  const allStrengths: string[] = [];
  const allImprovements: string[] = [];

  if (evaluatedCount > 0) {
    averages = {
      comp1: evals.reduce((s, e) => s + e.comp1_planning, 0) / evaluatedCount,
      comp2: evals.reduce((s, e) => s + e.comp2_accountability, 0) / evaluatedCount,
      comp3: evals.reduce((s, e) => s + e.comp3_teamwork, 0) / evaluatedCount,
      comp4: evals.reduce((s, e) => s + e.comp4_quality, 0) / evaluatedCount,
      comp5: evals.reduce((s, e) => s + e.comp5_time_management, 0) / evaluatedCount,
    };

    evals.forEach((ev) => {
      if (ev.strengths) {
        const filtered = filterInappropriate(ev.strengths);
        if (filtered) allStrengths.push(filtered);
      }
      if (ev.improvements) {
        const filtered = filterInappropriate(ev.improvements);
        if (filtered) allImprovements.push(filtered);
      }
    });
  }

  const summary = averages ? generateSummary(averages, allStrengths, allImprovements) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar student={typedStudent} />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">ผลประเมินของฉัน</h1>
          <Link
            href="/dashboard"
            className="text-[#667eea] hover:underline text-sm"
          >
            กลับหน้าหลัก
          </Link>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-[#667eea]">{evaluatedCount}</p>
              <p className="text-sm text-gray-500">คนที่ประเมินแล้ว</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-400">{totalPeers || 0}</p>
              <p className="text-sm text-gray-500">สมาชิกในกลุ่ม</p>
            </div>
          </div>
        </div>

        {!averages ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">ยังไม่มีเพื่อนคนใดประเมินคุณ</p>
          </div>
        ) : (
          <>
            {/* Competency Scores */}
            <div className="space-y-4 mb-6">
              {summary?.tableData.map((item, i) => (
                <CompetencyBar
                  key={i}
                  name={item.name}
                  score={parseFloat(item.score)}
                  suggestion={item.suggestion}
                />
              ))}
            </div>

            {/* Peer Feedback */}
            {(allStrengths.length > 0 || allImprovements.length > 0) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-800 mb-4">ความคิดเห็นจากเพื่อน</h3>

                {allStrengths.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-green-700 mb-2">จุดเด่น</h4>
                    <ul className="space-y-2">
                      {allStrengths.map((s, i) => (
                        <li key={i} className="bg-green-50 p-3 rounded-lg text-sm text-gray-700">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {allImprovements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-orange-700 mb-2">ข้อเสนอแนะ</h4>
                    <ul className="space-y-2">
                      {allImprovements.map((s, i) => (
                        <li key={i} className="bg-orange-50 p-3 rounded-lg text-sm text-gray-700">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
