'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Student } from '@/lib/types';

export default function SystemEvalPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [ratings, setRatings] = useState({
    ease_of_use: 0,
    usefulness: 0,
    design: 0,
    overall_satisfaction: 0,
  });
  const [likedMost, setLikedMost] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [recommend, setRecommend] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) { router.push('/'); return; }

      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('email', user.email)
        .single();
      if (data) setStudent(data as Student);
    }
    load();
  }, [router]);

  const questions = [
    { key: 'ease_of_use', label: 'ความง่ายในการใช้งาน' },
    { key: 'usefulness', label: 'ประโยชน์ของระบบ' },
    { key: 'design', label: 'ความสวยงามของการออกแบบ' },
    { key: 'overall_satisfaction', label: 'ความพึงพอใจโดยรวม' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    const ratingValues = Object.values(ratings);
    if (ratingValues.some((v) => v === 0)) return;

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from('system_evaluations').insert({
      student_id: student.id,
      ...ratings,
      liked_most: likedMost.trim() || null,
      suggestions: suggestions.trim() || null,
      would_recommend: recommend.trim() || null,
    });

    if (!error) setSuccess(true);
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">ขอบคุณสำหรับการประเมิน!</h2>
          <p className="text-gray-500 mb-6">ความคิดเห็นของคุณจะช่วยพัฒนาระบบให้ดียิ่งขึ้น</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold">ประเมินความพึงพอใจระบบ</h1>
          <p className="text-white/80 mt-1">ช่วยเราพัฒนาระบบให้ดียิ่งขึ้น</p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map(({ key, label }) => (
            <div key={key} className="bg-white rounded-xl shadow-sm p-6">
              <label className="block font-semibold text-gray-800 mb-3">{label}</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setRatings((prev) => ({ ...prev, [key]: value }))
                    }
                    className={`flex-1 py-3 rounded-lg border-2 text-center transition-all ${
                      ratings[key as keyof typeof ratings] === value
                        ? 'border-[#667eea] bg-[#667eea] text-white'
                        : 'border-gray-200 hover:border-[#667eea] text-gray-600'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-white rounded-xl shadow-sm p-6">
            <label className="block font-semibold text-gray-800 mb-2">สิ่งที่ชอบมากที่สุด</label>
            <textarea
              value={likedMost}
              onChange={(e) => setLikedMost(e.target.value)}
              className="w-full border rounded-lg p-3 text-gray-700"
              rows={3}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <label className="block font-semibold text-gray-800 mb-2">ข้อเสนอแนะ</label>
            <textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              className="w-full border rounded-lg p-3 text-gray-700"
              rows={3}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <label className="block font-semibold text-gray-800 mb-2">
              คุณจะแนะนำระบบนี้ให้ผู้อื่นหรือไม่?
            </label>
            <select
              value={recommend}
              onChange={(e) => setRecommend(e.target.value)}
              className="w-full border rounded-lg p-3 text-gray-700"
            >
              <option value="">เลือก...</option>
              <option value="แนะนำอย่างยิ่ง">แนะนำอย่างยิ่ง</option>
              <option value="แนะนำ">แนะนำ</option>
              <option value="เฉยๆ">เฉยๆ</option>
              <option value="ไม่แนะนำ">ไม่แนะนำ</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg font-medium disabled:opacity-50"
            >
              {submitting ? 'กำลังบันทึก...' : 'ส่งการประเมิน'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
