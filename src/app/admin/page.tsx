import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true });

  const { count: evalCount } = await supabase
    .from('evaluations')
    .select('*', { count: 'exact', head: true });

  const { count: systemEvalCount } = await supabase
    .from('system_evaluations')
    .select('*', { count: 'exact', head: true });

  // Get unique groups
  const { data: groups } = await supabase
    .from('students')
    .select('group_name')
    .not('group_name', 'is', null);

  const uniqueGroups = new Set(groups?.map((g) => g.group_name));

  const stats = [
    { label: 'นักศึกษาทั้งหมด', value: studentCount || 0, color: 'bg-blue-100 text-blue-700' },
    { label: 'กลุ่มทั้งหมด', value: uniqueGroups.size, color: 'bg-purple-100 text-purple-700' },
    { label: 'การประเมินทั้งหมด', value: evalCount || 0, color: 'bg-green-100 text-green-700' },
    { label: 'ประเมินระบบ', value: systemEvalCount || 0, color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ภาพรวมระบบ</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color} inline-block px-3 py-1 rounded-lg`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
