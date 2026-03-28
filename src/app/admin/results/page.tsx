'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Student } from '@/lib/types';

interface EvalResult {
  id: string;
  comp1_planning: number;
  comp2_accountability: number;
  comp3_teamwork: number;
  comp4_quality: number;
  comp5_time_management: number;
  strengths: string | null;
  improvements: string | null;
  created_at: string;
  evaluator: { name: string; student_id: string };
  evaluated: { name: string; student_id: string; group_name: string };
}

export default function ResultsPage() {
  const [results, setResults] = useState<EvalResult[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState('');

  const loadData = useCallback(async () => {
    const supabase = createClient();

    const { data: evalData } = await supabase
      .from('evaluations')
      .select(`
        id, comp1_planning, comp2_accountability, comp3_teamwork,
        comp4_quality, comp5_time_management, strengths, improvements, created_at,
        evaluator:students!evaluations_evaluator_id_fkey(name, student_id),
        evaluated:students!evaluations_evaluated_id_fkey(name, student_id, group_name)
      `)
      .order('created_at', { ascending: false });

    const { data: studentData } = await supabase
      .from('students')
      .select('*')
      .order('name');

    setResults((evalData as unknown as EvalResult[]) || []);
    setStudents((studentData as Student[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const groups = Array.from(new Set(students.map((s) => s.group_name).filter(Boolean)));

  const filteredResults = filterGroup
    ? results.filter((r) => r.evaluated?.group_name === filterGroup)
    : results;

  // Calculate per-student averages
  const studentAverages: Record<string, { name: string; student_id: string; group: string; count: number; total: number[] }> = {};
  filteredResults.forEach((r) => {
    const key = r.evaluated?.student_id;
    if (!key) return;
    if (!studentAverages[key]) {
      studentAverages[key] = { name: r.evaluated.name, student_id: key, group: r.evaluated.group_name, count: 0, total: [0, 0, 0, 0, 0] };
    }
    studentAverages[key].count++;
    studentAverages[key].total[0] += r.comp1_planning;
    studentAverages[key].total[1] += r.comp2_accountability;
    studentAverages[key].total[2] += r.comp3_teamwork;
    studentAverages[key].total[3] += r.comp4_quality;
    studentAverages[key].total[4] += r.comp5_time_management;
  });

  const handleExport = () => {
    const headers = ['ผู้ประเมิน', 'รหัสผู้ประเมิน', 'ผู้ถูกประเมิน', 'รหัสผู้ถูกประเมิน', 'กลุ่ม', 'วางแผน', 'รับผิดชอบ', 'ทำงานร่วม', 'คุณภาพ', 'ตรงเวลา', 'จุดเด่น', 'ข้อปรับปรุง', 'วันที่'];
    const rows = filteredResults.map((r) => [
      r.evaluator?.name, r.evaluator?.student_id,
      r.evaluated?.name, r.evaluated?.student_id, r.evaluated?.group_name,
      r.comp1_planning, r.comp2_accountability, r.comp3_teamwork, r.comp4_quality, r.comp5_time_management,
      r.strengths || '', r.improvements || '',
      new Date(r.created_at).toLocaleString('th-TH'),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluations_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ผลการประเมิน</h1>
        <div className="flex gap-3">
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm text-gray-700"
          >
            <option value="">ทุกกลุ่ม</option>
            {groups.map((g) => (
              <option key={g} value={g!}>{g}</option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-[#667eea] text-[#667eea] rounded-lg text-sm hover:bg-[#667eea] hover:text-white transition"
          >
            ส่งออก CSV
          </button>
        </div>
      </div>

      {/* Summary by Student */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">สรุปคะแนนรายบุคคล</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-gray-500">ชื่อ</th>
                <th className="px-3 py-2 text-left text-gray-500">รหัส</th>
                <th className="px-3 py-2 text-left text-gray-500">กลุ่ม</th>
                <th className="px-3 py-2 text-center text-gray-500">จำนวน</th>
                <th className="px-3 py-2 text-center text-gray-500">วางแผน</th>
                <th className="px-3 py-2 text-center text-gray-500">รับผิดชอบ</th>
                <th className="px-3 py-2 text-center text-gray-500">ทำงานร่วม</th>
                <th className="px-3 py-2 text-center text-gray-500">คุณภาพ</th>
                <th className="px-3 py-2 text-center text-gray-500">ตรงเวลา</th>
                <th className="px-3 py-2 text-center text-gray-500">เฉลี่ย</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Object.values(studentAverages).map((s) => {
                const avgs = s.total.map((t) => t / s.count);
                const overall = avgs.reduce((a, b) => a + b, 0) / 5;
                return (
                  <tr key={s.student_id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-800">{s.name}</td>
                    <td className="px-3 py-2 text-gray-500">{s.student_id}</td>
                    <td className="px-3 py-2 text-gray-500">{s.group}</td>
                    <td className="px-3 py-2 text-center">{s.count}</td>
                    {avgs.map((a, i) => (
                      <td key={i} className="px-3 py-2 text-center">{a.toFixed(2)}</td>
                    ))}
                    <td className="px-3 py-2 text-center font-bold text-[#667eea]">{overall.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {Object.keys(studentAverages).length === 0 && (
            <div className="text-center py-8 text-gray-400">ยังไม่มีข้อมูลการประเมิน</div>
          )}
        </div>
      </div>

      {/* Raw Evaluations */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">รายการประเมินทั้งหมด ({filteredResults.length})</h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredResults.map((r) => (
            <div key={r.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium text-gray-800">{r.evaluator?.name}</span>
                  <span className="text-gray-400 mx-2">→</span>
                  <span className="font-medium text-[#667eea]">{r.evaluated?.name}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleString('th-TH')}
                </span>
              </div>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>วางแผน: {r.comp1_planning}</span>
                <span>รับผิดชอบ: {r.comp2_accountability}</span>
                <span>ทำงานร่วม: {r.comp3_teamwork}</span>
                <span>คุณภาพ: {r.comp4_quality}</span>
                <span>ตรงเวลา: {r.comp5_time_management}</span>
              </div>
              {(r.strengths || r.improvements) && (
                <div className="mt-2 text-sm">
                  {r.strengths && <p className="text-green-700">จุดเด่น: {r.strengths}</p>}
                  {r.improvements && <p className="text-orange-700">ปรับปรุง: {r.improvements}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
