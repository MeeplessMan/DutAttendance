import { CameraCapture } from '../types';

export class CameraService {
    private stream: MediaStream | null = null;

    async initializeCamera(): Promise<MediaStream> {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false
            });
            return this.stream;
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw new Error('Unable to access camera');
        }
    }

    async captureImage(): Promise<CameraCapture> {
        if (!this.stream) {
            throw new Error('Camera not initialized');
        }

        const video = document.createElement('video');
        video.srcObject = this.stream;
        await video.play();

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL('image/jpeg');

        return {
            imageData,
            quality: 1.0, // Mock quality score
            livenessScore: 1.0 // Mock liveness score
        };
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }
}