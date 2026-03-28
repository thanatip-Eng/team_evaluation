import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Student } from '@/lib/types';

export default async function DashboardPage() {
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

  // Get group members
  const { data: members } = await supabase
    .from('students')
    .select('id, student_id, name, email')
    .eq('group_name', typedStudent.group_name)
    .neq('email', typedStudent.email);

  // Get existing evaluations by this user
  const { data: myEvaluations } = await supabase
    .from('evaluations')
    .select('evaluated_id')
    .eq('evaluator_id', typedStudent.id);

  const evaluatedIds = new Set(myEvaluations?.map((e) => e.evaluated_id) || []);

  const groupMembers = (members || []).map((m) => ({
    ...m,
    evaluated: evaluatedIds.has(m.id),
  }));

  const completedCount = groupMembers.filter((m) => m.evaluated).length;
  const totalCount = groupMembers.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar student={typedStudent} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* User Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            สวัสดี, {typedStudent.name}
          </h2>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>รหัส: {typedStudent.student_id}</span>
            <span>กลุ่ม: {typedStudent.group_name}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">ความคืบหน้าการประเมิน</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] transition-all"
                style={{
                  width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%',
                }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>

        {/* Group Members */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">สมาชิกในกลุ่ม</h3>
          {groupMembers.length === 0 ? (
            <p className="text-gray-400 text-center py-4">ไม่พบสมาชิกในกลุ่ม</p>
          ) : (
            <div className="space-y-3">
              {groupMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium text-gray-800">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.student_id}</p>
                  </div>
                  {member.evaluated ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      ประเมินแล้ว
                    </span>
                  ) : (
                    <Link
                      href={`/dashboard/evaluate/${encodeURIComponent(member.id)}`}
                      className="px-4 py-2 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                    >
                      ประเมิน
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/feedback"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition text-center"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800">ดูผลประเมินของฉัน</h4>
            <p className="text-sm text-gray-500 mt-1">ดูคะแนนและคำแนะนำจากเพื่อน</p>
          </Link>

          <Link
            href="/dashboard/system-eval"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition text-center"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800">ประเมินระบบ</h4>
            <p className="text-sm text-gray-500 mt-1">ให้คะแนนความพึงพอใจต่อระบบ</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
