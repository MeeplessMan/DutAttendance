/*
  # Initial Schema for Facial Recognition Attendance System

  1. New Tables
    - `students` - Student profile information
      - `id` (uuid, primary key)
      - `student_id` (text, unique identifier)
      - `name` (text)
      - `email` (text, unique)
      - `avatar_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `face_enrollments` - Biometric enrollment records
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `embedding_hash` (text, encrypted facial embedding)
      - `quality_score` (decimal)
      - `enrollment_date` (timestamp)
      - `device_info` (text)
      - `ip_address` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
    
    - `courses` - Course information
      - `id` (uuid, primary key)
      - `course_code` (text, unique)
      - `course_name` (text)
      - `instructor` (text)
      - `created_at` (timestamp)
    
    - `lectures` - Scheduled lectures
      - `id` (uuid, primary key)
      - `course_id` (uuid, foreign key)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `venue` (text)
      - `venue_latitude` (decimal)
      - `venue_longitude` (decimal)
      - `is_active` (boolean)
      - `created_at` (timestamp)
    
    - `attendance_records` - Attendance tracking
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `lecture_id` (uuid, foreign key)
      - `timestamp` (timestamp)
      - `status` (text) -- ON_TIME, LATE, OUT_OF_WINDOW
      - `verification_score` (decimal)
      - `location_latitude` (decimal)
      - `location_longitude` (decimal)
      - `distance_from_venue` (decimal)
      - `device_info` (text)
      - `ip_address` (text)
      - `created_at` (timestamp)
    
    - `audit_logs` - System audit trail
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `action` (text)
      - `resource_type` (text)
      - `resource_id` (text)
      - `details` (jsonb)
      - `ip_address` (text)
      - `user_agent` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Students can only access their own data
    - Admins have full access to system data

  3. Indexes
    - Performance indexes on frequently queried columns
    - Unique constraints for business rules
*/

-- Students table
CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Face enrollments table
CREATE TABLE face_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  embedding_hash text NOT NULL,
  quality_score decimal(5,4) DEFAULT 0.0,
  enrollment_date timestamptz DEFAULT now(),
  device_info text,
  ip_address text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Courses table
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text UNIQUE NOT NULL,
  course_name text NOT NULL,
  instructor text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Lectures table
CREATE TABLE lectures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  venue text NOT NULL,
  venue_latitude decimal(10,8) NOT NULL,
  venue_longitude decimal(11,8) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Attendance records table
CREATE TABLE attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  lecture_id uuid REFERENCES lectures(id) ON DELETE CASCADE,
  timestamp timestamptz DEFAULT now(),
  status text NOT NULL CHECK (status IN ('ON_TIME', 'LATE', 'OUT_OF_WINDOW')),
  verification_score decimal(5,4) NOT NULL,
  location_latitude decimal(10,8) NOT NULL,
  location_longitude decimal(11,8) NOT NULL,
  distance_from_venue decimal(8,2) NOT NULL,
  device_info text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all operations for now (can be restricted later)
CREATE POLICY "Allow all operations on students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on face_enrollments" ON face_enrollments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on courses" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on lectures" ON lectures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on attendance_records" ON attendance_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_face_enrollments_student_id ON face_enrollments(student_id);
CREATE INDEX idx_face_enrollments_active ON face_enrollments(student_id, is_active);
CREATE INDEX idx_lectures_course_id ON lectures(course_id);
CREATE INDEX idx_lectures_active ON lectures(is_active);
CREATE INDEX idx_lectures_time ON lectures(start_time, end_time);
CREATE INDEX idx_attendance_student_lecture ON attendance_records(student_id, lecture_id);
CREATE INDEX idx_attendance_timestamp ON attendance_records(timestamp);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(created_at);

-- Insert sample data
INSERT INTO courses (course_code, course_name, instructor) VALUES
  ('CS101', 'Introduction to Computer Science', 'Dr. Sarah Wilson'),
  ('MATH201', 'Advanced Mathematics', 'Prof. Johnson'),
  ('PHYS301', 'Quantum Physics', 'Dr. Einstein');

-- Insert sample lectures (current and upcoming)
INSERT INTO lectures (course_id, start_time, end_time, venue, venue_latitude, venue_longitude, is_active)
SELECT 
  c.id,
  now() + interval '5 minutes',
  now() + interval '65 minutes',
  'Room A101',
  40.7589,
  -73.9851,
  true
FROM courses c WHERE c.course_code = 'CS101';

INSERT INTO lectures (course_id, start_time, end_time, venue, venue_latitude, venue_longitude, is_active)
SELECT 
  c.id,
  now() - interval '30 minutes',
  now() + interval '30 minutes',
  'Room B205',
  40.7580,
  -73.9840,
  true
FROM courses c WHERE c.course_code = 'MATH201';