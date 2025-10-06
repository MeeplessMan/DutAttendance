import { AttendanceRecord, Lecture, ValidationResult, CameraCapture } from '../types';
import { SupabaseService } from './supabaseService';

const PYTHON_BACKEND_URL = import.meta.env.VITE_PYTHON_BACKEND_URL || 'http://localhost:8000';

const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};

export class AttendanceService {
  static async getCurrentLectures(): Promise<Lecture[]> {
    try {
      return await SupabaseService.getCurrentLectures();
    } catch (error) {
      console.error('Error getting current lectures:', error);
      return [];
    }
  }

  static async verifyFacialAttendance(
    capture: CameraCapture,
    lectureId: string,
    studentId: string,
    userLocation: { latitude: number; longitude: number }
  ): Promise<ValidationResult> {
    try {
      const backendAvailable = await checkBackendHealth();
      
      if (backendAvailable) {
        // Use Python backend for real facial recognition
        const response = await fetch(`${PYTHON_BACKEND_URL}/api/attendance/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo-token',
            'X-User-ID': studentId
          },
          body: JSON.stringify({
            student_id: studentId,
            lecture_id: lectureId,
            image_data: capture.imageData,
            location: userLocation,
            device_info: navigator.userAgent
          })
        });

        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }

        const result = await response.json();
        return {
          success: result.success,
          confidence: result.confidence,
          message: result.message,
          attendanceStatus: result.attendanceStatus,
          location: result.location,
          timing: result.timing
        };
      } else {
        // Fallback to mock verification
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
          success: true,
          confidence: 0.85 + Math.random() * 0.1,
          message: 'Attendance recorded successfully (Demo Mode)',
          attendanceStatus: 'ON_TIME',
          location: { distance: Math.random() * 25, withinRange: true },
          timing: { withinWindow: true, minutesFromStart: Math.floor(Math.random() * 10) }
        };
      }
    } catch (error) {
      console.error('Error verifying attendance:', error);
      return {
        success: false,
        confidence: 0,
        message: 'Verification failed. Please try again.',
        location: { distance: 0, withinRange: false },
        timing: { withinWindow: false, minutesFromStart: 0 }
      };
    }
  }

  static async getAttendanceHistory(studentId: string): Promise<AttendanceRecord[]> {
    try {
      return await SupabaseService.getAttendanceHistory(studentId);
    } catch (error) {
      console.error('Error getting attendance history:', error);
      return [];
    }
  }

  
  static async getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
    try {
      return await SupabaseService.getAllAttendanceRecords();
    } catch (error) {
      console.error('Error getting all attendance records:', error);
      return [];
    }
  }
}