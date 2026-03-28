'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { COMPETENCY_LABELS } from '@/lib/types';

interface EvaluationFormProps {
  evaluatorId: string;
  evaluatedId: string;
  evaluatedName: string;
  evaluatedStudentId: string;
}

const RATING_LABELS = ['', 'ควรปรับปรุงมาก', 'ควรปรับปรุง', 'พอใช้', 'ดี', 'ดีมาก'];

export default function EvaluationForm({
  evaluatorId,
  evaluatedId,
  evaluatedName,
  evaluatedStudentId,
}: EvaluationFormProps) {
  const router = useRouter();
  const [ratings, setRatings] = useState({
    comp1_planning: 0,
    comp2_accountability: 0,
    comp3_teamwork: 0,
    comp4_quality: 0,
    comp5_time_management: 0,
  });
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const competencyKeys = Object.keys(COMPETENCY_LABELS) as Array<keyof typeof COMPETENCY_LABELS>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all ratings
    const ratingValues = Object.values(ratings);
    if (ratingValues.some((v) => v === 0)) {
      setError('กรุณาให้คะแนนทุกด้าน');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from('evaluations').insert({
        evaluator_id: evaluatorId,
        evaluated_id: evaluatedId,
        ...ratings,
        strengths: strengths.trim() || null,
        improvements: improvements.trim() || null,
      });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('คุณได้ประเมินเพื่อนคนนี้ไปแล้ว');
        } else {
          setError('เกิดข้อผิดพลาด: ' + insertError.message);
        }
        return;
      }

      router.push('/dashboard?evaluated=success');
      router.refresh();
    } catch {
      setError('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Evaluated person info */}
      <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl p-6">
        <p className="text-sm text-white/80">กำลังประเมิน</p>
        <h2 className="text-xl font-bold">{evaluatedName}</h2>
        <p className="text-sm text-white/70">{evaluatedStudentId}</p>
      </div>

      {/* Competency Ratings */}
      {competencyKeys.map((key) => {
        const dbKey = key === 'comp1'
          ? 'comp1_planning'
          : key === 'comp2'
          ? 'comp2_accountability'
          : key === 'comp3'
          ? 'comp3_teamwork'
          : key === 'comp4'
          ? 'comp4_quality'
          : 'comp5_time_management';

        return (
          <div key={key} className="bg-white rounded-xl shadow-sm p-6">
            <label className="block font-semibold text-gray-800 mb-3">
              {COMPETENCY_LABELS[key]}
            </label>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setRatings((prev) => ({ ...prev, [dbKey]: value }))
                  }
                  className={`flex-1 min-w-[60px] py-3 rounded-lg border-2 text-center transition-all ${
                    ratings[dbKey as keyof typeof ratings] === value
                      ? 'border-[#667eea] bg-[#667eea] text-white'
                      : 'border-gray-200 hover:border-[#667eea] text-gray-600'
                  }`}
                >
                  <div className="text-lg font-bold">{value}</div>
                  <div className="text-xs mt-1">{RATING_LABELS[value]}</div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Feedback */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <label className="block font-semibold text-gray-800 mb-2">
          จุดเด่นของเพื่อน
        </label>
        <textarea
          value={strengths}
          onChange={(e) => setStrengths(e.target.value)}
          className="w-full border rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
          rows={3}
          placeholder="เขียนจุดเด่นของเพื่อน..."
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <label className="block font-semibold text-gray-800 mb-2">
          ข้อควรปรับปรุง
        </label>
        <textarea
          value={improvements}
          onChange={(e) => setImprovements(e.target.value)}
          className="w-full border rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
          rows={3}
          placeholder="เขียนข้อเสนอแนะเพื่อการพัฒนา..."
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? 'กำลังบันทึก...' : 'บันทึกการประเมิน'}
        </button>
      </div>
    </form>
  );
}
