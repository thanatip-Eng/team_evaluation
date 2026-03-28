'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Student } from '@/lib/types';

export default function GroupsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [newGroup, setNewGroup] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  // Group students by group_name
  const groups: Record<string, Student[]> = {};
  const ungrouped: Student[] = [];
  students.forEach((s) => {
    if (s.group_name) {
      if (!groups[s.group_name]) groups[s.group_name] = [];
      groups[s.group_name].push(s);
    } else {
      ungrouped.push(s);
    }
  });

  const toggleSelect = (id: string) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const assignGroup = async () => {
    if (!newGroup.trim()) { setError('กรุณาระบุชื่อกลุ่ม'); return; }
    if (selectedStudents.size === 0) { setError('กรุณาเลือกนักศึกษา'); return; }

    setError('');
    const supabase = createClient();
    const ids = Array.from(selectedStudents);

    const { error: err } = await supabase
      .from('students')
      .update({ group_name: newGroup.trim() })
      .in('id', ids);

    if (err) { setError(err.message); return; }

    setSuccess(`ย้าย ${ids.length} คนไปกลุ่ม "${newGroup.trim()}" สำเร็จ`);
    setSelectedStudents(new Set());
    setNewGroup('');
    loadStudents();
    setTimeout(() => setSuccess(''), 3000);
  };

  const removeFromGroup = async (studentId: string) => {
    const supabase = createClient();
    await supabase.from('students').update({ group_name: null }).eq('id', studentId);
    loadStudents();
  };

  if (loading) return <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">จัดการกลุ่ม</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>
      )}

      {/* Assign to Group */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">จัดกลุ่มนักศึกษา</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">ชื่อกลุ่ม</label>
            <input
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              placeholder="เช่น A, B, Group1"
              className="w-full border rounded-lg p-3 text-gray-700"
            />
          </div>
          <button
            onClick={assignGroup}
            disabled={selectedStudents.size === 0}
            className="px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg text-sm disabled:opacity-50"
          >
            ย้ายไปกลุ่ม ({selectedStudents.size} คน)
          </button>
        </div>
      </div>

      {/* Groups */}
      {Object.entries(groups).map(([groupName, members]) => (
        <div key={groupName} className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">
              กลุ่ม {groupName}
              <span className="text-sm font-normal text-gray-500 ml-2">({members.length} คน)</span>
            </h3>
          </div>
          <div className="space-y-2">
            {members.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={selectedStudents.has(s.id)}
                    onChange={() => toggleSelect(s.id)}
                    className="w-4 h-4 text-[#667eea] rounded"
                  />
                  <div>
                    <span className="font-medium text-gray-800">{s.name}</span>
                    <span className="text-sm text-gray-500 ml-2">{s.student_id}</span>
                  </div>
                </label>
                <button
                  onClick={() => removeFromGroup(s.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  นำออกจากกลุ่ม
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Ungrouped */}
      {ungrouped.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">
            ยังไม่ได้จัดกลุ่ม
            <span className="text-sm font-normal text-gray-500 ml-2">({ungrouped.length} คน)</span>
          </h3>
          <div className="space-y-2">
            {ungrouped.map((s) => (
              <label key={s.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStudents.has(s.id)}
                  onChange={() => toggleSelect(s.id)}
                  className="w-4 h-4 text-[#667eea] rounded"
                />
                <div>
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <span className="text-sm text-gray-500 ml-2">{s.student_id} - {s.email}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
