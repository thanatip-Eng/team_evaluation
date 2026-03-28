export interface Student {
  id: string;
  student_id: string;
  email: string;
  name: string;
  group_name: string | null;
  role: 'student' | 'admin';
  created_at: string;
}

export interface Evaluation {
  id: string;
  evaluator_id: string;
  evaluated_id: string;
  comp1_planning: number;
  comp2_accountability: number;
  comp3_teamwork: number;
  comp4_quality: number;
  comp5_time_management: number;
  strengths: string | null;
  improvements: string | null;
  created_at: string;
}

export interface EvaluationWithNames extends Evaluation {
  evaluator: Pick<Student, 'name' | 'student_id' | 'email'>;
  evaluated: Pick<Student, 'name' | 'student_id' | 'email'>;
}

export interface SystemEvaluation {
  id: string;
  student_id: string;
  ease_of_use: number;
  usefulness: number;
  design: number;
  overall_satisfaction: number;
  liked_most: string | null;
  suggestions: string | null;
  would_recommend: string | null;
  created_at: string;
}

export interface GroupMember {
  id: string;
  student_id: string;
  name: string;
  email: string;
  evaluated: boolean;
}

export interface FeedbackData {
  totalPeers: number;
  evaluatedCount: number;
  averages: CompetencyAverages;
  strengths: string[];
  improvements: string[];
  summary: SummaryData;
}

export interface CompetencyAverages {
  comp1: number;
  comp2: number;
  comp3: number;
  comp4: number;
  comp5: number;
}

export interface SummaryItem {
  name: string;
  score: string;
  suggestion: string;
}

export interface SummaryData {
  tableData: SummaryItem[];
  feedbackSummary: string;
}

export const COMPETENCY_LABELS: Record<string, string> = {
  comp1: 'การมีส่วนร่วมในการวางแผนงาน',
  comp2: 'ความรับผิดชอบต่องานที่ได้รับมอบหมาย',
  comp3: 'การทำงานร่วมกับผู้อื่น',
  comp4: 'คุณภาพของงานที่ส่งมอบ',
  comp5: 'การตรงต่อเวลา/การจัดการเวลา',
};
