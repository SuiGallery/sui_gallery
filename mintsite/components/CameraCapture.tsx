import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"


interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;  
  isLoading: boolean; // 新增
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

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Error accessing camera:", err));

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

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
  };

  const saveAsNFT = () => {
    if (selectedImage) {
      onCapture(selectedImage);
      console.log('Save as NFT');
    }
  };

  useEffect(() => {
    if (!selectedImage && videoRef.current && videoRef.current.srcObject) {
      videoRef.current.play();
    }
  }, [selectedImage]);

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto">
      <div className="relative w-full aspect-video">
        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover rounded-lg ${selectedImage ? 'hidden' : ''}`} />
        <canvas ref={canvasRef} className={`w-full h-full object-cover rounded-lg ${selectedImage ? '' : 'hidden'}`} width={768} height={576} />
        <Button 
          onClick={captureImage} 
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
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
        className={`mt-4 bg-blue-500 text-white items-center ${!selectedImage ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!selectedImage}
      >
        Save as NFT
      </Button>
    </div>
  );
};
