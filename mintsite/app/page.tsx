'use client'
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import Image from "next/image";
import { useImageUploader } from "@/hooks/useImageUploader";
import { mint } from "@/contract";
import { SuccessModal } from '../components/SuccessModal';
import { CameraCapture } from "../components/CameraCapture";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"


export default function Home() {
  const currentAccount = useCurrentAccount();
  const [isLoading, setIsLoading] = useState(false);
  const { uploading, storeBlob } = useImageUploader();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleCapture = (capturedImageUrl: string) => {
    setCapturedImage(capturedImageUrl);
    handleMint();
  };

  const handleMint = async () => {
    console.log("Captured Image:", capturedImage);
    console.log("Current Account:", currentAccount?.address);
    if (!capturedImage || !currentAccount?.address) {
      alert("Please capture an image and connect your wallet before minting.");
      return;
    }

    try {
      const blobInfo = await storeBlob(capturedImage);
      console.log("Uploaded blob info:", blobInfo);
      if (blobInfo && currentAccount?.address) {
        setIsLoading(true);
        const tx = await mint(blobInfo.blobId, currentAccount?.address);
        await signAndExecuteTransaction({
          transaction: tx,
        }, {
          onSuccess: (result) => {
            console.log("Transaction successful:", result);
            setTxDigest(result.digest);
            setIsLoading(false);
            setIsModalOpen(true);
          },
          onError: (error) => {
            console.error("Transaction failed:", error);
            alert("Failed to mint NFT. Please try again.");
            setIsLoading(false);
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
    <div className="bg-gradient-to-b from-blue-500 to-fuchsia-500 min-h-screen w-full p-4 flex flex-col">

      <Card className="flex flex-col flex-grow overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Event Photo Booth</h1>
          <div className="flex items-center gap-5">
            <Button size="lg" onClick={() => { console.log('Share Event') }} className="w-auto">
              <p>Share Event</p>
            </Button>
            <ConnectButton className="w-full sm:w-44 h-12 sm:h-14 transition-all duration-300 cursor-pointer active:scale-95" />
          </div>

        </div>

        <Tabs defaultValue="account" className="flex flex-col flex-grow overflow-hidden">
          <TabsList className="w-full">
            <TabsTrigger value="account" className="w-1/2">Camera</TabsTrigger>
            <TabsTrigger value="password" className="w-1/2">Gallery</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="flex-grow overflow-hidden">
            <CameraCapture onCapture={handleCapture} isLoading={isLoading || uploading} />
          </TabsContent>
          <TabsContent value="password">Change your password here.</TabsContent>
        </Tabs>
      </Card>

      <SuccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        txDigest={txDigest}
      />
    </div>
  );
}
