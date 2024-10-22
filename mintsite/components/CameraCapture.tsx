import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Spinner } from "./ui/spinner"

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;  
  isLoading: boolean;
}

interface CapturedImage {
  id: string;
  dataUrl: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, isLoading }) => {
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    startCamera();
  }, [facingMode]);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: facingMode } 
    })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Error accessing camera:", err));
  };

  const toggleCamera = () => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  };

  const captureImage = () => {
    if (selectedImage) {
      setSelectedImage(null);
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
        const newImage = { id: Date.now().toString(), dataUrl: imageDataUrl };
        setCapturedImages(prev => [...prev, newImage]);
      }
    }
  };

  const removeImage = (id: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== id));
    if (selectedImage === id) {
      setSelectedImage(null);
    }
  };

  const selectImage = (dataUrl: string) => {
    if (capturedImages.some(img => img.dataUrl === dataUrl)) {
      setSelectedImage(dataUrl);
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          const img = new Image();
          img.onload = () => {
            context.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            context.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
          };
          img.src = dataUrl;
        }
      }
    } else {
      console.error('Attempted to select an image that is not in capturedImages');
      setSelectedImage(null);
    }
  };

  const saveAsNFT = () => {
    if (selectedImage) {
      onCapture(selectedImage);
      console.log('Save as NFT', selectedImage);
    }
  };

  useEffect(() => {
    if (!selectedImage && videoRef.current && videoRef.current.srcObject) {
      videoRef.current.play();
    }
  }, [selectedImage]);

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto relative">
      <div className="relative w-full aspect-video">
        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover rounded-lg ${selectedImage ? 'hidden' : ''}`} />
        <canvas ref={canvasRef} className={`w-full h-full object-cover rounded-lg ${selectedImage ? '' : 'hidden'}`} width={768} height={576} />
        <Button 
          onClick={captureImage} 
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </Button>
        <Button
          onClick={toggleCamera}
          className="absolute top-4 right-4 bg-gray-500 text-white p-2 rounded-full shadow-lg"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </Button>
      </div>
      <ScrollArea className="w-full h-40 mt-4">
        <div className="flex gap-4 pb-4">
          {capturedImages.map((img) => (
            <div key={img.id} className="relative flex-shrink-0">
              <img 
                src={img.dataUrl} 
                alt="Captured" 
                className={`w-32 h-32 object-cover cursor-pointer rounded-lg shadow-md ${selectedImage === img.dataUrl ? 'border-4 border-blue-500' : ''}`}
                onClick={() => selectImage(img.dataUrl)}
              />
              <button 
                onClick={() => removeImage(img.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl shadow-md"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Button 
        onClick={saveAsNFT} 
        className={`mt-2 bg-blue-500 text-white items-center ${!selectedImage || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!selectedImage || isLoading}
      >
        Save as NFT
      </Button>

      {/* 加载遮罩层 */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-2">
            <Spinner className="text-blue-500" />
            <span className="text-gray-700">Uploading image...</span>
          </div>
        </div>
      )}
    </div>
  );
};
