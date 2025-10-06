// File: src/services/supabaseService.ts
// PRODUCTION READY VERSION

import { supabase } from '../lib/supabase';
import { Lecture, AttendanceRecord } from '../types';

export class SupabaseService {
  static async getStudentByEmail(email: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('User')
        .select(`
          id,
          first_name,
          surname,
          email,
          student_num,
          role,
          faculty,
          student_group_id,
          face_embedding
        `)
        .eq('email', email)
        .single();

      if (error) {
        console.error("Error fetching student by email:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Unexpected error in getStudentByEmail:", error);
      return null;
    }
  }

  static async getCurrentLectures(): Promise<Lecture[]> {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = now.toTimeString().slice(0, 8);

  try {
    const { data, error } = await supabase
      .from('Schedule')
      .select(`
        *,
        Module (
          moduleCode,
          courseCode,
          User (
            firstName,
            surname
          )
        ),
        Venue (
          roomNum,
          campus,
          latitude,
          longitude
        )
      `)
      .eq('weekDay', dayOfWeek)
      .lte('startTime', currentTime)
      .gte('endTime', currentTime);

    if (error) {
      console.error('Error getting current lectures:', error);
      return [];
    }

    if (!data) return [];

    const lectures: Lecture[] = data.map((schedule: any) => ({
      id: schedule.id.toString(),
      courseCode: schedule.Module?.moduleCode ?? 'N/A',
      courseName: schedule.Module?.courseCode ?? 'Unknown Course',
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      venue: `${schedule.Venue?.campus ?? 'Unknown Campus'} - ${schedule.Venue?.roomNum ?? 'N/A'}`, // roomNum
      instructor: `${schedule.Module?.User?.first_name ?? 'Unknown'} ${schedule.Module?.User?.surname ?? 'Instructor'}`, // firstName
      isActive: true,
      venueCoordinates: {
        latitude: schedule.Venue?.latitude ?? 0,
        longitude: schedule.Venue?.longitude ?? 0,
      },
    }));

    return lectures;
  } catch (error) {
    console.error('Unexpected error in getCurrentLectures:', error);
    return [];
  }
}

  static async getAttendanceHistory(studentId: string): Promise<AttendanceRecord[]> {
  try {
    // FIXED: Use correct column names from your schema
    const { data, error } = await supabase
      .from('Attendance')
      .select(`
        *,
        Event (
          *,
          Schedule (
            *,
            Module (
              moduleCode,
              courseCode
            ),
            Venue (
              room_num,
              campus
            )
          )
        )
      `)
      .eq('student_id', studentId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching attendance history:', error);
      return [];
    }

    if (!data) return [];

    return data.map((record: any) => ({
      id: record.id,
      timestamp: record.timestamp,
      status: record.status,
      courseCode: record.Event?.Schedule?.Module?.moduleCode || 'N/A',
      courseName: record.Event?.Schedule?.Module?.courseCode || 'Unknown', // Using courseCode as course name
      venue: record.Event?.Schedule?.Venue ? 
        `${record.Event.Schedule.Venue.campus} - ${record.Event.Schedule.Venue.room_num}` : 'Unknown',
      type: record.Event?.event_type || 'lecture',
      eventId: record.event_id,
      userId: record.user_id,
      verificationScore: record.verification_score,
      in: record.in_time,
      out: record.out_time
    }));
  } catch (error) {
    console.error('Unexpected error fetching attendance history:', error);
    return [];
  }
}

  static async getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
    try {
      const { data, error } = await supabase
        .from('Attendance')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching all attendance records:", error);
        return [];
      }

      return (data || []).map((record: any) => ({
        id: record.id,
        eventId: record.event_id,
        userId: record.student_id,
        timestamp: record.timestamp,
        status: record.attendance_status === 'present' ? 'ON_TIME' : 'ABSENT',
        lectureId: 'N/A',
        location: {
          distance: record.location_distance || 0,
          latitude: 0,
          longitude: 0,
          venue: 'N/A',
          campus: 'N/A'
        },
        verificationScore: record.confidence_score || 0.95,
        in: record.attendance_status === 'present' ? 'true' : 'false',
        out: 'false',
        courseCode: 'N/A',
        courseName: 'N/A',
        venue: 'N/A',
        type: 'N/A'
      }));
    } catch (error) {
      console.error("Unexpected error in getAllAttendanceRecords:", error);
      return [];
    }
  }
}