// File: src/types/index.ts - UPDATED VERSION

import { ReactNode } from "react";

export interface User {
  surname: ReactNode;
  student_number: ReactNode;
  first_name: any;
  id: string;
  name: string;
  email: string;
  studentId?: string;
  role: 'student' | 'admin' | 'lecturer';
  isEnrolled: boolean;
  avatar?: string;
}

export interface Lecture {
  id: number;
  courseCode: string;
  courseName: string;
  startTime: string;
  endTime: string;
  venue: string;
  instructor: string;
  isActive: boolean;
  venueCoordinates: {
    latitude: number;
    longitude: number;
  };
}

// src/types/attendance.ts
export interface AttendanceRecord {
  lectureId: ReactNode;
  location: any;
  id: string;
  timestamp: string;
  status: string;
  courseCode: string;
  courseName: string;
  venue: string;
  type: string;
  // Make these optional since you're not using them
  eventId?: string;
  userId?: string;
  verificationScore?: number;
  in?: string;
  out?: string;
}


export interface EnrollmentStatus {
  isEnrolled: boolean;
  quality: 'poor' | 'good';
  enrollmentDate?: string;
}

export interface CameraCapture {
  imageData: string;
  quality: number;
  livenessScore: number;
}

export interface ValidationResult {
  success: boolean;
  confidence: number;
  message: string;
  location: {
    distance: number;
    withinRange: boolean;
  };
  timing: {
    withinWindow: boolean;
    minutesFromStart: number;
  };
  attendanceStatus?: 'ON_TIME' | 'LATE' | 'OUT_OF_WINDOW';
}

// NEW INTERFACES FOR DEGREE MANAGEMENT
export interface DegreeProgram {
  id: number;
  name: string;
  code: string;
  faculty: string;
  duration_years: number;
  created_at: string;
}

export interface Stream {
  id: number;
  name: string;
  code: string;
  degree_program_id: number;
  created_at: string;
}

export interface AcademicYear {
  id: number;
  year_name: string;
  year_number: number;
  created_at: string;
  start_date?: string | number | Date; // Match the expected type
  end_date?: string | number | Date;
  [key: string]: string | number | Date | undefined; // Update index signature
}

export interface StudentEnrollment {
  id: number;
  user_id: string;
  degree_program_id: number;
  stream_id: number;
  academic_year_id: number;
  enrollment_date: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface TimetableEntry {
  id: number;
  degree_program_id: number;
  stream_id: number;
  academic_year_id: number;
  module_id: number;
  schedule_id: number;
  entry_type: 'lecture' | 'tutorial' | 'practical' | 'lab';
  staff_name: string;
  room_code: string;
  effective_from: string;
  effective_to: string;
  created_at: string;
}

// Add these to your existing types.ts file

export interface StudentGroup {
  id: string;
  group_code: string;
  group_name: string;
  degree_id: string | DegreeProgram;
  stream_id: string | Stream;
  academic_year_id: string | AcademicYear;
  degree?: DegreeProgram;
  stream?: Stream;
  academic_year?: AcademicYear;
}

export interface Module {
  id: string;
  module_code: string;
  module_name: string;
  course_id?: string | Course;
  lecturer_id?: string | User;
  student_group_id?: string | StudentGroup;
}

export interface Venue {
  id: string;
  room_num: string;
  campus: string;
  latitude?: number;
  longitude?: number;
}


export interface Course {
  id: string;
  course_code: string;
  course_name: string;
  student_group_id?: string | StudentGroup;
}

