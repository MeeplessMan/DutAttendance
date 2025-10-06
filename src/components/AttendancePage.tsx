import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AttendanceService } from '../services/attendanceService';
import { useLocation } from '../hooks/useLocation';
import { useAuth } from '../contexts/AuthContext';
import { Lecture, ValidationResult, CameraCapture as CameraCaptureType } from '../types';
import CameraCapture from './CameraCapture';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const { getCurrentLocation } = useLocation();

  useEffect(() => {
    loadLectures();
  }, []);

  const loadLectures = async () => {
    try {
      const data = await AttendanceService.getCurrentLectures();
      setLectures(data);
    } catch (error) {
      console.error('Error loading lectures:', error);
    }
  };

  const handleLectureSelect = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setShowCamera(true);
    setResult(null);
  };

  // Inside src/components/AttendancePage.tsx

  const handleCapture = async (capture: CameraCaptureType) => {
    if (!selectedLecture || !user) return;

    setIsProcessing(true);
    
    try {
      const location = await getCurrentLocation();
      if (!location) {
        // --- THIS IS FIX #1 ---
        // Provide a complete ValidationResult object for the error state
        setResult({
          success: false,
          confidence: 0,
          message: 'Location permission is required to check in.',
          location: { distance: 0, withinRange: false },
          timing: { withinWindow: false, minutesFromStart: 0 }
        });
        // --- END OF FIX ---
        setIsProcessing(false);
        return;
      }

       const response = await fetch('http://localhost:8000/api/student/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_data: capture.imageData,
          lecture_id: selectedLecture.id,
          student_id: user.studentId,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        }),
      });

      const validationResult = await response.json();

      setResult({
          success: validationResult.success,
          confidence: validationResult.confidence || 0,
          message: validationResult.message,
          // Use real data if available, otherwise use placeholders
          location: validationResult.location || { distance: 0, withinRange: false },
          timing: validationResult.timing || { withinWindow: false, minutesFromStart: 0 }
      });

    } catch (error) {
      console.error('Error verifying attendance:', error);
      // --- THIS IS FIX #2 ---
      // Also provide a complete ValidationResult object here
      setResult({
        success: false,
        confidence: 0,
        message: 'Could not connect to the verification server. Please try again.',
        location: { distance: 0, withinRange: false },
        timing: { withinWindow: false, minutesFromStart: 0 }
      });
      // --- END OF FIX ---
    } finally {
      setIsProcessing(false);
    }
  };

  const resetProcess = () => {
    setSelectedLecture(null);
    setShowCamera(false);
    setResult(null);
  };

  const getStatusIcon = (result: ValidationResult) => {
    if (result.success) {
      return <CheckCircle className="w-16 h-16 text-green-500" />;
    } else {
      return <XCircle className="w-16 h-16 text-red-500" />;
    }
  };

  const getStatusColor = (result: ValidationResult) => {
    return result.success ? 'green' : 'red';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Check-in to Lecture</h1>
        <p className="text-gray-600">Select a lecture and verify your attendance using facial recognition</p>
      </div>

      {!showCamera && (
        <div className="grid gap-4 md:grid-cols-2">
          {lectures.map((lecture) => (
            <motion.div
              key={lecture.id}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLectureSelect(lecture)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{lecture.courseName}</h3>
                  <p className="text-blue-600 font-medium">{lecture.courseCode}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    {format(new Date(lecture.startTime), 'h:mm a')} - {format(new Date(lecture.endTime), 'h:mm a')}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm">{lecture.venue}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Instructor: {lecture.instructor}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <motion.button
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Check-in Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {lectures.length === 0 && !showCamera && (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Active Lectures</h3>
          <p className="text-gray-600">There are no lectures scheduled at this time.</p>
        </div>
      )}

      <AnimatePresence>
        {showCamera && selectedLecture && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-blue-50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedLecture.courseName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {format(new Date(selectedLecture.startTime), 'h:mm a')} - {format(new Date(selectedLecture.endTime), 'h:mm a')}
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {selectedLecture.venue}
                </div>
                <div className="text-gray-600">
                  Instructor: {selectedLecture.instructor}
                </div>
              </div>
            </div>

            {!result && (
              <CameraCapture
                onCapture={handleCapture}
                isProcessing={isProcessing}
              />
            )}

            {result && (
              <motion.div
                className={`bg-${getStatusColor(result)}-50 border border-${getStatusColor(result)}-200 rounded-2xl p-8 text-center`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-4">
                  {getStatusIcon(result)}
                </div>

                <h3 className={`text-2xl font-bold text-${getStatusColor(result)}-800 mb-4`}>
                  {result.success ? 'Attendance Recorded!' : 'Verification Failed'}
                </h3>

                <p className={`text-${getStatusColor(result)}-700 text-lg mb-6`}>
                  {result.message}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {(result.confidence * 100).toFixed(1)}%
                    </div>
                    <div className="text-gray-600 text-sm">Confidence Score</div>
                  </div>
                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {result.location.distance.toFixed(0)}m
                    </div>
                    <div className="text-gray-600 text-sm">Distance from Venue</div>
                  </div>
                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {result.timing.minutesFromStart > 0 ? '+' : ''}{result.timing.minutesFromStart}min
                    </div>
                    <div className="text-gray-600 text-sm">From Start Time</div>
                  </div>
                </div>

                {result.success && result.attendanceStatus && (
                  <div className="mb-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${result.attendanceStatus === 'ON_TIME'
                      ? 'bg-green-100 text-green-800'
                      : result.attendanceStatus === 'LATE'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {result.attendanceStatus === 'ON_TIME' ? 'On Time' :
                        result.attendanceStatus === 'LATE' ? 'Late' : 'Out of Window'}
                    </span>
                  </div>
                )}

                <button
                  onClick={resetProcess}
                  className="bg-white text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back to Lectures
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendancePage;