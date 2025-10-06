// File: src/services/faceEnrollmentService.ts
// --- THE FINAL, CORRECTED, AND SIMPLIFIED VERSION ---

import { CameraCapture, EnrollmentStatus } from '../types';
import { supabase } from '../lib/supabase';

// We no longer need a backend URL here, as the enrollment logic
// is now handled by our main Python backend.

export class FaceEnrollmentService {
  /**
   * Checks if a user has a face embedding stored in their profile.
   * @param studentNum The student's unique number (e.g., "22382901")
   */
  static async checkEnrollmentStatus(studentNum: string): Promise<EnrollmentStatus> {
    try {
      // Query the 'User' table for a specific student
      const { data: user, error } = await supabase
        .from('User')
        .select('face_embedding') // We only need to check for the existence of the embedding
        .eq('student_num', studentNum)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means "not found", which is not a fatal error here.
        throw error;
      }

      // If a user was found and their face_embedding is not null, they are enrolled.
      const isEnrolled = !!user?.face_embedding;

      return {
        isEnrolled: isEnrolled,
        quality: isEnrolled ? 'good' : 'poor', // Simplified quality status
      };
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      // Return a default "not enrolled" status on any error
      return { isEnrolled: false, quality: 'poor' };
    }
  }

  /**
   * Sends captured images to the Python backend for processing and enrollment.
   * @param captures An array of captured image data.
   * @param studentId The UUID of the logged-in user.
   */
  static async enrollFace(
    captures: CameraCapture[],
    studentId: string // This should be the user's UUID
  ): Promise<{ success: boolean; message: string; }> {
    try {
      // Extract just the base64 image data strings
      const images = captures.map(capture => capture.imageData);

      // Call our robust Python backend to handle the complex dlib processing
      const response = await fetch('http://localhost:8000/api/student/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId, // The user's UUID
          images: images,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // If the server returned an error, use its message
        throw new Error(result.message || 'The server returned an error.');
      }

      return result;

    } catch (error) {
      console.error('Error enrolling face:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        success: false,
        message: `Enrollment failed: ${errorMessage}`,
      };
    }
  }
}