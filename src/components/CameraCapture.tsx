import React, { useEffect } from 'react';
import { useCamera } from '../hooks/useCamera';


interface CameraCaptureProps {
  onCapture: (capture: { imageData: string; quality: number; livenessScore: number }) => void;
  isProcessing: boolean;
  // --- THIS IS FIX #3 ---
  // Add '?' to make these props optional
  requiredAngles?: string[];
  currentAngle?: string;
  // --- END OF FIX ---
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  isProcessing,
  requiredAngles,
  currentAngle
}) => {
  const { videoRef, error, startCamera, captureImage } = useCamera();

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  const handleCapture = async () => {
  const capture = await captureImage();
  if (capture && capture.imageData && capture.imageData !== 'data:,') {
    onCapture(capture);
  } else {
    console.error('Invalid image captured');
    // Show error to user
  }
};

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full rounded-xl"
      />
      <button
        onClick={handleCapture}
        disabled={isProcessing}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : 'Capture'}
      </button>
    </div>
  );
};

export default CameraCapture;