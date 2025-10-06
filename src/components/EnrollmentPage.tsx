import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, User, RotateCw } from 'lucide-react';
import { CameraService } from '../services/cameraService';
import { FaceEnrollmentService } from '../services/faceEnrollmentService';
import { EnrollmentStatus, CameraCapture as CameraCaptureType } from '../types';
import CameraCapture from './CameraCapture';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export interface FaceEnrollment {
  id: string;
  student_id: string;
  is_active: boolean;
  quality_score: number;
  created_at: string;
  updated_at: string;
}

const EnrollmentPage: React.FC = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraService = useRef(new CameraService());
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus | null>(null);
  const [currentStep, setCurrentStep] = useState<'status' | 'enrollment' | 'result'>('status');
  const [currentAngle, setCurrentAngle] = useState<'front' | 'left' | 'right'>('front');
  const [captures, setCaptures] = useState<{ [key: string]: CameraCaptureType }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrollmentResult, setEnrollmentResult] = useState<{ success: boolean; message: string } | null>(null);

  const angles: ('front' | 'left' | 'right')[] = ['front', 'left', 'right'];

  useEffect(() => {
    if (user?.studentId) {
      checkEnrollmentStatus();
    }
  }, [user]);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await cameraService.current.initializeCamera();
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Failed to initialize camera:', error);
      }
    };

    initCamera();

    return () => {
      cameraService.current.stopCamera();
    };
  }, []);

  const checkEnrollmentStatus = async () => {
    if (!user?.studentId) return;

    try {
      const status = await FaceEnrollmentService.checkEnrollmentStatus(user.studentId);
      setEnrollmentStatus(status);
    } catch (error) {
      console.error('Error checking enrollment status:', error);
    }
  };

  const handleStartEnrollment = () => {
    setCurrentStep('enrollment');
    setCurrentAngle('front');
    setCaptures({});
    setEnrollmentResult(null);
  };

  const handleCapture = (capture: CameraCaptureType) => {
    const newCaptures = { ...captures, [currentAngle]: capture };
    setCaptures(newCaptures);

    const currentIndex = angles.indexOf(currentAngle);
    if (currentIndex < angles.length - 1) {
      setCurrentAngle(angles[currentIndex + 1]);
    } else {
      processEnrollment(newCaptures);
    }
  };

  // Inside src/components/EnrollmentPage.tsx

  const processEnrollment = async (allCaptures: { [key: string]: CameraCaptureType }) => {
    if (!user) return; // Make sure the user is logged in

    setIsProcessing(true);

    try {
      // Extract just the image data from the captures
      const imageArray = Object.values(allCaptures).map(capture => capture.imageData);
      
      // --- THIS IS THE FIX ---
      // Calling our new backend enrollment endpoint
      const response = await fetch('http://localhost:8000/api/student/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Pass the logged-in user's UUID
          student_id: user.id, 
          images: imageArray,
        }),
      });

      const result = await response.json();
      // --- END OF FIX ---
      
      setEnrollmentResult(result);
      setCurrentStep('result');

      if (result.success) {
        // Refresh the enrollment status to show the user they are now enrolled
        await checkEnrollmentStatus(); 
      }
    } catch (error) {
      console.error("Error during enrollment process:", error);
      setEnrollmentResult({
        success: false,
        message: 'An error occurred while connecting to the server. Please try again.'
      });
      setCurrentStep('result');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetEnrollment = () => {
    setCurrentStep('status');
    setCaptures({});
    setEnrollmentResult(null);
    setCurrentAngle('front');
  };

  const getAngleLabel = (angle: 'front' | 'left' | 'right') => {
    switch (angle) {
      case 'front': return 'Front View';
      case 'left': return 'Left Profile';
      case 'right': return 'Right Profile';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getQualityBg = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-50 border-green-200';
      case 'good': return 'bg-blue-50 border-blue-200';
      case 'fair': return 'bg-yellow-50 border-yellow-200';
      case 'poor': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Face Enrollment</h1>
        <p className="text-gray-600">Set up your facial recognition profile for secure attendance</p>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 'status' && enrollmentStatus && (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className={`rounded-2xl p-6 border ${getQualityBg(enrollmentStatus.quality)}`}>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {enrollmentStatus.isEnrolled ? (
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  ) : (
                    <AlertCircle className="w-12 h-12 text-orange-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {enrollmentStatus.isEnrolled ? 'Face Enrolled' : 'Face Not Enrolled'}
                  </h3>

                  {enrollmentStatus.isEnrolled ? (
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        Your face has been successfully enrolled in the system.
                      </p>
                      {enrollmentStatus.enrollmentDate && (
                        <p className="text-sm text-gray-500">
                          Enrolled on: {new Date(enrollmentStatus.enrollmentDate).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Quality:</span>
                        <span className={`text-sm font-medium ${getQualityColor(enrollmentStatus.quality)} capitalize`}>
                          {enrollmentStatus.quality}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 mb-4">
                      You need to enroll your face to use the attendance system. This process will capture your face from three angles for secure verification.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <motion.button
                  onClick={handleStartEnrollment}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <User className="w-5 h-5" />
                  <span>{enrollmentStatus.isEnrolled ? 'Update Enrollment' : 'Start Enrollment'}</span>
                </motion.button>

                {enrollmentStatus.isEnrolled && (
                  <button
                    onClick={checkEnrollmentStatus}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-colors"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 'enrollment' && (
          <motion.div
            key="enrollment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-blue-50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Face Enrollment Process</h2>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Step {angles.indexOf(currentAngle) + 1} of {angles.length}</span>
                  <span>{Math.round(((angles.indexOf(currentAngle) + 1) / angles.length) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((angles.indexOf(currentAngle) + 1) / angles.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Angle Indicators */}
              <div className="flex justify-center space-x-4 mb-6">
                {angles.map(angle => (
                  <div
                    key={angle}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${captures[angle] ? 'bg-green-100 text-green-800' :
                        angle === currentAngle ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {captures[angle] && <CheckCircle className="w-4 h-4" />}
                    <span className="text-sm font-medium">{getAngleLabel(angle)}</span>
                  </div>
                ))}
              </div>
            </div>

            <CameraCapture
              onCapture={handleCapture}
              isProcessing={isProcessing}
              requiredAngles={angles}
              currentAngle={currentAngle}
            />

            <div className="text-center">
              <button
                onClick={resetEnrollment}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel Enrollment
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'result' && enrollmentResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`rounded-2xl p-8 text-center ${enrollmentResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
          >
            <div className="mb-4">
              {enrollmentResult.success ? (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              ) : (
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
              )}
            </div>

            <h3 className={`text-2xl font-bold mb-4 ${enrollmentResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
              {enrollmentResult.success ? 'Enrollment Successful!' : 'Enrollment Failed'}
            </h3>

            <p className={`text-lg mb-6 ${enrollmentResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
              {enrollmentResult.message}
            </p>

            <div className="flex justify-center space-x-4">
              <motion.button
                onClick={resetEnrollment}
                className="bg-white text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {enrollmentResult.success ? 'Done' : 'Try Again'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8">
        <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl shadow-md" />
      </div>
    </div>
  );
};

export default EnrollmentPage;