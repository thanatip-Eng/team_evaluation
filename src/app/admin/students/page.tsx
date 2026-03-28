'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Student } from '@/lib/types';

export default function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ student_id: '', email: '', name: '', group_name: '', role: 'student' });
  const [error, setError] = useState('');
  const [csvInput, setCsvInput] = useState('');
  const [showCsvImport, setShowCsvImport] = useState(false);

  const loadStudents = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('students')
      .select('*')
      .order('group_name')
      .order('name');
    setStudents((data as Student[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const supabase = createClient();

    if (editingId) {
      const { error: err } = await supabase
        .from('students')
        .update({
          student_id: form.student_id,
          email: form.email.toLowerCase().trim(),
          name: form.name,
          group_name: form.group_name || null,
          role: form.role,
        })
        .eq('id', editingId);
      if (err) { setError(err.message); return; }
    } else {
      const { error: err } = await supabase.from('students').insert({
        student_id: form.student_id,
        email: form.email.toLowerCase().trim(),
        name: form.name,
        group_name: form.group_name || null,
        role: form.role,
      });
      if (err) { setError(err.message); return; }
    }

    setShowForm(false);
    setEditingId(null);
    setForm({ student_id: '', email: '', name: '', group_name: '', role: 'student' });
    loadStudents();
  };

  const handleEdit = (s: Student) => {
    setForm({
      student_id: s.student_id,
      email: s.email,
      name: s.name,
      group_name: s.group_name || '',
      role: s.role,
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบนักศึกษาคนนี้?')) return;
    const supabase = createClient();
    await supabase.from('students').delete().eq('id', id);
    loadStudents();
  };

  const handleCsvImport = async () => {
    setError('');
    const lines = csvInput.trim().split('\n').filter(Boolean);
    const rows = lines.map((line) => {
      const [student_id, email, name, group_name] = line.split(',').map((s) => s.trim());
      return { student_id, email: email?.toLowerCase(), name, group_name: group_name || null, role: 'student' as const };
    });

    const invalid = rows.filter((r) => !r.student_id || !r.email || !r.name);
    if (invalid.length > 0) {
      setError('บางแถวข้อมูลไม่ครบ (ต้องมี: รหัส, อีเมล, ชื่อ)');
      return;
    }

    const supabase = createClient();
    const { error: err } = await supabase.from('students').upsert(rows, { onConflict: 'student_id' });
    if (err) { setError(err.message); return; }

    setShowCsvImport(false);
    setCsvInput('');
    loadStudents();
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">จัดการนักศึกษา</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowCsvImport(!showCsvImport); setShowForm(false); }}
            className="px-4 py-2 border border-[#667eea] text-[#667eea] rounded-lg text-sm hover:bg-[#667eea] hover:text-white transition"
          >
            นำเข้า CSV
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ student_id: '', email: '', name: '', group_name: '', role: 'student' }); setShowCsvImport(false); }}
            className="px-4 py-2 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg text-sm"
          >
            + เพิ่มนักศึกษา
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* CSV Import */}
      {showCsvImport && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">นำเข้าจาก CSV</h3>
          <p className="text-sm text-gray-500 mb-3">รูปแบบ: รหัสนักศึกษา, อีเมล, ชื่อ, กลุ่ม (แต่ละบรรทัด)</p>
          <textarea
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            className="w-full border rounded-lg p-3 font-mono text-sm text-gray-700"
            rows={6}
            placeholder="660001, student1@gmail.com, สมชาย ใจดี, A&#10;660002, student2@gmail.com, สมหญิง รักดี, A"
          />
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => setShowCsvImport(false)} className="px-4 py-2 border rounded-lg text-gray-600 text-sm">
              ยกเลิก
            </button>
            <button onClick={handleCsvImport} className="px-4 py-2 bg-[#667eea] text-white rounded-lg text-sm">
              นำเข้า
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editingId ? 'แก้ไขนักศึกษา' : 'เพิ่มนักศึกษา'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              required
              placeholder="รหัสนักศึกษา"
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
              className="border rounded-lg p-3 text-gray-700"
            />
            <input
              required
              type="email"
              placeholder="อีเมล"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border rounded-lg p-3 text-gray-700"
            />
            <input
              required
              placeholder="ชื่อ-สกุล"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded-lg p-3 text-gray-700"
            />
            <input
              placeholder="กลุ่ม"
              value={form.group_name}
              onChange={(e) => setForm({ ...form, group_name: e.target.value })}
              className="border rounded-lg p-3 text-gray-700"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="border rounded-lg p-3 text-gray-700"
            >
              <option value="student">นักศึกษา</option>
              <option value="admin">ผู้ดูแลระบบ</option>
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border rounded-lg text-gray-600">
                ยกเลิก
              </button>
              <button type="submit" className="flex-1 py-3 bg-[#667eea] text-white rounded-lg">
                {editingId ? 'บันทึก' : 'เพิ่ม'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">รหัส</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ชื่อ</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">อีเมล</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">กลุ่ม</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">สิทธิ์</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">{s.student_id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{s.email}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{s.group_name || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    s.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {s.role === 'admin' ? 'ผู้ดูแล' : 'นักศึกษา'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(s)} className="text-blue-600 hover:underline text-sm mr-3">
                    แก้ไข
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline text-sm">
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="text-center py-8 text-gray-400">ยังไม่มีนักศึกษาในระบบ</div>
        )}
      </div>
    </div>
  );
}
