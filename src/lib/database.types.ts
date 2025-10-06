// File: src/lib/database.types.ts
// --- THE FINAL, CORRECTED, AND COMPLETE VERSION ---

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string
          email: string
          role: string
          faculty: string
          surname: string
          first_name: string
          student_num: string
          student_group_id?: string
          face_embedding: Json | null
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id: string
          email: string
          role: string
          faculty: string
          surname: string
          first_name: string
          student_num: string
          curr_course?: string | null
          image?: string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['User']['Row'], 'id'>>
      }
      Course: {
        Row: {
          id: number
          courseCode: string
          faculty: string
          courseName: string
        }
        Insert: Omit<Database['public']['Tables']['Course']['Row'], 'id'>
        Update: Partial<Omit<Database['public']['Tables']['Course']['Row'], 'id'>>
      }
      Module: {
        Row: {
          id: number
          module_code: string
          module_name: string
          lecturer_id: string
          student_group_id?: string
        }
        Insert: Omit<Database['public']['Tables']['Module']['Row'], 'id'>
        Update: Partial<Omit<Database['public']['Tables']['Module']['Row'], 'id'>>
      }
      Venue: {
        Row: {
          id: number
          roomNum: string
          campus: string
          latitude: number
          longitude: number
        }
        Insert: Omit<Database['public']['Tables']['Venue']['Row'], 'id'>
        Update: Partial<Omit<Database['public']['Tables']['Venue']['Row'], 'id'>>
      }
      StudentModule: {
        Row: {
          id: number
          current: boolean
          mark: number | null
          moduleId: number
          studentId: string
        }
        Insert: Omit<Database['public']['Tables']['StudentModule']['Row'], 'id'>
        Update: Partial<Omit<Database['public']['Tables']['StudentModule']['Row'], 'id'>>
      }
      Schedule: {
        Row: {
          id: number
          module_id: number
          venue_id: number
          day_of_week: number
          start_time: string
          end_time: string
          entry_type?: string
        }
        Insert: Omit<Database['public']['Tables']['Schedule']['Row'], 'id'>
        Update: Partial<Omit<Database['public']['Tables']['Schedule']['Row'], 'id'>>
      }
      Event: {
        Row: {
          id: number
          status: string
          date: string
          scheduleId: number
        }
        Insert: Omit<Database['public']['Tables']['Event']['Row'], 'id'>
        Update: Partial<Omit<Database['public']['Tables']['Event']['Row'], 'id'>>
      }
      Attendance: {
        Row: {
          id: number
          eventId: number
          in: boolean
          out: boolean
          userId: string
        }
        Insert: Omit<Database['public']['Tables']['Attendance']['Row'], 'id'>
        Update: Partial<Omit<Database['public']['Tables']['Attendance']['Row'], 'id'>>
      }

      // --- NEW TABLES YOU ADDED ---
      DegreeProgram: {
        Row: {
          id: number
          name: string
          code: string
          faculty: string
          duration_years: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['DegreeProgram']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['DegreeProgram']['Row'], 'id'>>
      }
      Stream: {
        Row: {
          id: number
          name: string
          code: string
          degree_program_id: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['Stream']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['Stream']['Row'], 'id'>>
      }
      StudentEnrollment: {
        Row: {
          id: number
          user_id: string
          degree_program_id: number
          stream_id: number
          academic_year_id: number
          enrollment_date: string
          status: 'pending' | 'approved' | 'rejected'
          approved_by: string | null
          approved_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['StudentEnrollment']['Row'], 'id' | 'created_at' | 'enrollment_date'>
        Update: Partial<Omit<Database['public']['Tables']['StudentEnrollment']['Row'], 'id'>>
      }
      AcademicYear: {
        Row: {
          id: number
          year_name: string
          year_number: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['AcademicYear']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['AcademicYear']['Row'], 'id'>>
      }
      TimetableEntry: {
        Row: {
          id: number
          degree_program_id: number
          stream_id: number
          academic_year_id: number
          module_id: number
          schedule_id: number
          entry_type: 'lecture' | 'tutorial' | 'practical' | 'lab'
          staff_name: string
          room_code: string
          effective_from: string
          effective_to: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['TimetableEntry']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['TimetableEntry']['Row'], 'id'>>
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}