import { CompetencyAverages, SummaryData, SummaryItem } from './types';

const INAPPROPRIATE_WORDS = [
  'โง่', 'งี่เง่า', 'ไอ้', 'เหี้ย', 'ควาย', 'สัตว์', 'ห่า', 'บ้า', 'เลว', 'แย่',
  'stupid', 'idiot', 'fool', 'dumb', 'hate', 'worst', 'terrible', 'useless',
];

export function filterInappropriate(text: string): string | null {
  for (const word of INAPPROPRIATE_WORDS) {
    if (new RegExp(word, 'gi').test(text)) {
      return null;
    }
  }
  return text;
}

export function generateSummary(
  averages: CompetencyAverages,
  strengths: string[],
  improvements: string[]
): SummaryData {
  const competencies: { name: string; score: number; suggestion: string }[] = [
    {
      name: 'การมีส่วนร่วมในการวางแผนงาน',
      score: averages.comp1,
      suggestion:
        'เข้าร่วมประชุมวางแผนทุกครั้ง เตรียมตัวล่วงหน้า และกล้าแสดงความคิดเห็นเชิงสร้างสรรค์',
    },
    {
      name: 'ความรับผิดชอบต่องานที่ได้รับมอบหมาย',
      score: averages.comp2,
      suggestion:
        'สร้างตารางติดตามงาน ตั้งเตือน และรายงานความคืบหน้าให้ทีมรับรู้เป็นระยะ',
    },
    {
      name: 'การทำงานร่วมกับผู้อื่น',
      score: averages.comp3,
      suggestion:
        'สื่อสารกับทีมบ่อยขึ้น เปิดใจรับฟังความคิดเห็น และเสนอตัวช่วยเหลือเพื่อนเมื่อเห็นว่าเขาต้องการ',
    },
    {
      name: 'คุณภาพของงานที่ส่งมอบ',
      score: averages.comp4,
      suggestion:
        'ตรวจสอบงานอย่างละเอียดก่อนส่ง ขอคำแนะนำจากเพื่อนหรืออาจารย์ และใช้เวลาปรับปรุงให้ดีที่สุด',
    },
    {
      name: 'การตรงต่อเวลา/การจัดการเวลา',
      score: averages.comp5,
      suggestion:
        'วางแผนการทำงานล่วงหน้า ตั้งเตือนสำหรับงานสำคัญ และเริ่มทำงานก่อนเวลาเผื่อไว้',
    },
  ];

  const overallScore =
    (averages.comp1 + averages.comp2 + averages.comp3 + averages.comp4 + averages.comp5) / 5;

  competencies.push({
    name: 'ภาพรวมการทำงานเป็นทีม',
    score: overallScore,
    suggestion:
      'มุ่งเน้นพัฒนาด้านที่คะแนนต่ำกว่า 3.5 ก่อน แล้วค่อยยกระดับด้านอื่นๆ ต่อ รักษามาตรฐานด้านที่ดีอยู่แล้วให้คงที่',
  });

  const tableData: SummaryItem[] = competencies.map((comp) => ({
    name: comp.name,
    score: comp.score.toFixed(2),
    suggestion: comp.suggestion,
  }));

  let feedbackSummary = '';
  if (strengths.length > 0) {
    feedbackSummary += 'เพื่อนมองว่าคุณ: ' + strengths[0];
  }
  if (improvements.length > 0) {
    if (feedbackSummary) feedbackSummary += ' | ';
    feedbackSummary += 'ข้อเสนอแนะ: ' + improvements[0];
  }

  return { tableData, feedbackSummary };
}

export function getScoreColor(score: number): string {
  if (score >= 4.5) return 'text-green-600';
  if (score >= 3.5) return 'text-blue-600';
  if (score >= 2.5) return 'text-yellow-600';
  return 'text-red-600';
}

export function getScoreLabel(score: number): string {
  if (score >= 4.5) return 'ดีเยี่ยม';
  if (score >= 3.5) return 'ดี';
  if (score >= 2.5) return 'พอใช้';
  return 'ควรปรับปรุง';
}

export function getScoreBgColor(score: number): string {
  if (score >= 4.5) return 'bg-green-100';
  if (score >= 3.5) return 'bg-blue-100';
  if (score >= 2.5) return 'bg-yellow-100';
  return 'bg-red-100';
}
