
import React, { useRef, useState, useEffect } from 'react';
import { AlertTriangle, X, SwitchCamera } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface CameraCaptureProps {
    onCapture: (blob: Blob) => void;
    onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
    const { t } = useLanguage();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [isSwitching, setIsSwitching] = useState(false);

    const isNative = Capacitor.isNativePlatform();

    // Native path: use Capacitor Camera plugin (no video preview needed — opens system camera)
    useEffect(() => {
        if (!isNative) return;

        const takeNativePhoto = async () => {
            try {
                const permResult = await Camera.requestPermissions({ permissions: ['camera'] });
                if (permResult.camera !== 'granted') {
                    setError('Camera permission denied. Please enable it in Settings.');
                    return;
                }

                const photo = await Camera.getPhoto({
                    quality: 85,
                    allowEditing: false,
                    resultType: CameraResultType.Base64,
                    source: CameraSource.Camera,
                    saveToGallery: false,
                });

                if (photo.base64String) {
                    const byteChars = atob(photo.base64String);
                    const byteNums = new Array(byteChars.length);
                    for (let i = 0; i < byteChars.length; i++) {
                        byteNums[i] = byteChars.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNums);
                    const blob = new Blob([byteArray], { type: 'image/jpeg' });
                    onCapture(blob);
                } else {
                    onCancel();
                }
            } catch (err: any) {
                // User cancelled — not a real error
                if (err?.message?.includes('cancelled') || err?.message?.includes('canceled') || err?.message?.includes('No image')) {
                    onCancel();
                } else {
                    console.error('Camera error:', err);
                    setError(t('receiptProcessor.cameraError'));
                }
            }
        };

        takeNativePhoto();
    }, [isNative]);

    // Web path: use getUserMedia for live preview
    useEffect(() => {
        if (isNative) return;

        let isMounted = true;
        let localStream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    setStream(null);
                }

                await new Promise(resolve => setTimeout(resolve, 100));
                if (!isMounted) return;

                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
                });

                if (!isMounted) {
                    mediaStream.getTracks().forEach(track => track.stop());
                    return;
                }

                localStream = mediaStream;
                setStream(mediaStream);

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
                setError(null);
            } catch (err) {
                console.error('Error accessing camera:', err);
                if (isMounted) setError(t('receiptProcessor.cameraError'));
            } finally {
                if (isMounted) setIsSwitching(false);
            }
        };

        startCamera();

        return () => {
            isMounted = false;
            localStream?.getTracks().forEach(track => track.stop());
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [facingMode, isNative]);

    const toggleCamera = () => {
        if (isSwitching) return;
        setIsSwitching(true);
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    };

    const takePicture = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;

                if (facingMode === 'user') {
                    context.translate(canvasRef.current.width, 0);
                    context.scale(-1, 1);
                }

                context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
                canvasRef.current.toBlob((blob) => {
                    if (blob) onCapture(blob);
                }, 'image/jpeg', 0.85);
            }
        }
    };

    // On native, show a loading/error state — the system camera handles the UI
    if (isNative) {
        return (
            <div className="relative bg-black h-full min-h-[400px] flex flex-col items-center justify-center">
                {error ? (
                    <div className="flex flex-col items-center justify-center text-center p-6">
                        <AlertTriangle className="text-red-500 mb-2" size={32} />
                        <p className="text-white mb-4">{error}</p>
                        <button onClick={onCancel} className="px-4 py-2 bg-[var(--bg-tertiary)] text-white rounded-lg">
                            {t('common.cancel')}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6">
                        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
                        <p className="text-white/60 text-sm">Opening camera...</p>
                    </div>
                )}
            </div>
        );
    }

    // Web preview UI
    return (
        <div className="relative bg-black h-full min-h-[400px] flex flex-col">
            <canvas ref={canvasRef} className="hidden" />

            {error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <AlertTriangle className="text-red-500 mb-2" size={32} />
                    <p className="text-white">{error}</p>
                    <button onClick={onCancel} className="mt-4 px-4 py-2 bg-[var(--bg-tertiary)] text-white rounded-lg">
                        {t('common.cancel')}
                    </button>
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />
                    <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start">
                        <button
                            onClick={toggleCamera}
                            disabled={isSwitching}
                            className={`p-3 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md transition-all border border-white/10 ${isSwitching ? 'opacity-50 animate-pulse' : 'active:scale-90'}`}
                            title="Switch Camera"
                        >
                            <SwitchCamera size={28} />
                        </button>
                        <button
                            onClick={onCancel}
                            className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md transition-all border border-white/10 active:scale-90"
                        >
                            <X size={28} />
                        </button>
                    </div>
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
                        <button
                            onClick={takePicture}
                            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
                            aria-label="Capture photo"
                        >
                            <div className="w-12 h-12 bg-white rounded-full" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CameraCapture;
