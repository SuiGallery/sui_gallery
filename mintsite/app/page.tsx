'use client'
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { TextArea } from "@radix-ui/themes";
import { useState, useRef, useEffect } from "react";
import { Button } from "../components/Button";
import { ImageDisplay } from "../components/ImageDisplay";
import { isValidSuiAddress } from "@mysten/sui.js/utils";
import Image from "next/image";
import { useImageUploader } from "@/hooks/useImageUploader";
import { mint } from "@/contract";
import { generateImage as generateImageFromAPI } from "@/utils";
import { SuccessModal } from '../components/SuccessModal';

export default function Home() {
  const currentAccount = useCurrentAccount();
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { uploading, storeBlob } = useImageUploader();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        setImageUrl(imageDataUrl);
      }
    }
  };

  const handleMint = async () => {
    if (!capturedImage) {
      alert("Please capture an image first.");
      return;
    }

    try {
      const blobInfo = await storeBlob(capturedImage);
      console.log("Uploaded blob info:", blobInfo);
      if (blobInfo && currentAccount?.address) {
        const tx = await mint(blobInfo.blobId, currentAccount?.address);
        await signAndExecuteTransaction({
          transaction: tx,
        }, {
          onSuccess: (result) => {
            console.log("Transaction successful:", result);
            setTxDigest(result.digest);
            setIsModalOpen(true);
          },
          onError: (error) => {
            console.error("Transaction failed:", error);
            alert("Failed to mint NFT. Please try again.");
          }
        })
      }
    } catch (error) {
      console.error('Error in handleMint:', error);
      alert(`Failed to mint NFT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txDigest, setTxDigest] = useState('');

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

  return (
    <div className="bg-[url('/bg.png')] bg-cover bg-center h-screen w-screen p-10 pb-20 flex flex-col justify-between items-center">
      {/* Nav */}
      <nav className="flex justify-between items-center w-full">
        <div className="text-2xl font-bold">
          <Image src="/title.png" alt="Logo" width={343} height={188} priority />
        </div>
        <ConnectButton className="bg-gradient-to-b w-44 h-14 from-blue-500 to-fuchsia-500 hover:scale-105 transition-all duration-300 cursor-pointer active:scale-95" />
      </nav>

      <div className="relative">
        <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-lg" />
        <canvas ref={canvasRef} className="hidden" width="640" height="480" />
        {capturedImage && (
          <img src={capturedImage} alt="Captured" className="absolute top-0 left-0 w-full h-full object-cover" />
        )}
      </div>

      {/* Mint */}
      <div className="flex w-1/2 justify-center items-center gap-4">
        <TextArea
          placeholder="Add a description"
          className="w-full h-36"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
        <div className="w-1/6 flex flex-col gap-4">
          <Button
            onClick={captureImage}
            className="w-full bg-gradient-to-b from-blue-500 to-fuchsia-200"
          >
            <p className="uppercase font-bold text-white self-center">Capture</p>
          </Button>
          <Button
            onClick={handleMint}
            disabled={!capturedImage || uploading || currentAccount?.address === undefined || !isValidSuiAddress(currentAccount?.address)}
            isLoading={uploading}
            className="w-full bg-gradient-to-b from-fuchsia-200 to-fuchsia-500"
          >
            <p className="uppercase font-bold text-white self-center">Mint</p>
          </Button>
        </div>
      </div>
      <footer className="flex justify-center items-center w-full">
        <p className="text-white">© 2024 Sui Galery</p>
      </footer>

      <div className="absolute left-5 top-1/3  flex flex-col gap-4 justify-center items-center w-1/5 p-2 bg-white/10 rounded-lg">
        
      </div>

      <SuccessModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        txDigest={txDigest} 
      />
    </div>
  );
}
