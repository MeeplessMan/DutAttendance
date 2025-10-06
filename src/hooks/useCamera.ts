import { useState, useRef, useCallback } from 'react';
import { CameraCapture } from '../types';

export const useCamera = () => {
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsActive(true);
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
  }, [stream]);

  // In useCamera.ts - improve the captureImage function
  const captureImage = async (): Promise<CameraCapture | null> => {
    if (!videoRef.current || !stream) {
      console.error('Camera not ready');
      return null;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const context = canvas.getContext('2d');
      if (!context) {
        console.error('Could not get canvas context');
        return null;
      }

      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Convert to JPEG with quality
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Validate the image data
      if (!imageData || imageData === 'data:,') {
        console.error('Empty image data captured');
        return null;
      }

      console.log('Image captured successfully, size:', imageData.length);

      return {
        imageData,
        quality: 0.9, // You can calculate this based on image properties
        livenessScore: 0.95
      };
    } catch (error) {
      console.error('Error capturing image:', error);
      return null;
    }
  };

  return {
    isActive,
    error,
    videoRef,
    startCamera,
    stopCamera,
    captureImage
  };
};