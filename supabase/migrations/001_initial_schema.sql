-- =============================================
-- Peer Evaluation System - Database Schema
-- =============================================

-- Students table (replaces 'name' sheet)
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  group_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Evaluations table (replaces 'peerresult' sheet)
CREATE TABLE evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluator_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  evaluated_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  comp1_planning INTEGER NOT NULL CHECK (comp1_planning BETWEEN 1 AND 5),
  comp2_accountability INTEGER NOT NULL CHECK (comp2_accountability BETWEEN 1 AND 5),
  comp3_teamwork INTEGER NOT NULL CHECK (comp3_teamwork BETWEEN 1 AND 5),
  comp4_quality INTEGER NOT NULL CHECK (comp4_quality BETWEEN 1 AND 5),
  comp5_time_management INTEGER NOT NULL CHECK (comp5_time_management BETWEEN 1 AND 5),
  strengths TEXT,
  improvements TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(evaluator_id, evaluated_id)
);

-- System evaluations table (replaces 'systemeval' sheet)
CREATE TABLE system_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  ease_of_use INTEGER CHECK (ease_of_use BETWEEN 1 AND 5),
  usefulness INTEGER CHECK (usefulness BETWEEN 1 AND 5),
  design INTEGER CHECK (design BETWEEN 1 AND 5),
  overall_satisfaction INTEGER CHECK (overall_satisfaction BETWEEN 1 AND 5),
  liked_most TEXT,
  suggestions TEXT,
  would_recommend TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_group ON students(group_name);
CREATE INDEX idx_evaluations_evaluator ON evaluations(evaluator_id);
CREATE INDEX idx_evaluations_evaluated ON evaluations(evaluated_id);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_evaluations ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's student record
CREATE OR REPLACE FUNCTION get_current_student_id()
RETURNS UUID AS $$
  SELECT id FROM students WHERE email = auth.jwt() ->> 'email' LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM students
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Students policies
CREATE POLICY "Students can view members in their group"
  ON students FOR SELECT
  USING (
    group_name = (SELECT group_name FROM students WHERE id = get_current_student_id())
    OR is_admin()
  );

CREATE POLICY "Admins can insert students"
  ON students FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update students"
  ON students FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete students"
  ON students FOR DELETE
  USING (is_admin());

-- Evaluations policies
CREATE POLICY "Students can insert their own evaluations"
  ON evaluations FOR INSERT
  WITH CHECK (evaluator_id = get_current_student_id());

CREATE POLICY "Students can view evaluations they received"
  ON evaluations FOR SELECT
  USING (
    evaluated_id = get_current_student_id()
    OR evaluator_id = get_current_student_id()
    OR is_admin()
  );

-- System evaluations policies
CREATE POLICY "Students can insert system evaluations"
  ON system_evaluations FOR INSERT
  WITH CHECK (student_id = get_current_student_id());

CREATE POLICY "Admins can view system evaluations"
  ON system_evaluations FOR SELECT
  USING (is_admin() OR student_id = get_current_student_id());
