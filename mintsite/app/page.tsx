'use client'
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useState,useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import Image from "next/image";
import { useImageUploader } from "@/hooks/useImageUploader";
import { getEvent, mint, Event } from "@/contract";
import { SuccessModal } from '../components/SuccessModal';
import { CameraCapture } from "../components/CameraCapture";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { getSubdomainAndPath, subdomainToObjectId } from "@/utils";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";

export default function Home() {
  const currentAccount = useCurrentAccount();
  const [isLoading, setIsLoading] = useState(false);
  const { uploading, storeBlob } = useImageUploader();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [event, setEvent] = useState<Event>();
  const [isInitialDataFetched, setIsInitialDataFetched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txDigest, setTxDigest] = useState('');

  const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
  });

  const handleCapture = async (capturedImageUrl: string) => {    
    await handleMint(capturedImageUrl);
  };

  const handleMint = async (imageUrl: string) => {
    console.log("Captured Image:", imageUrl);
    console.log("Current Account:", currentAccount?.address);
    if (!imageUrl || !currentAccount?.address) {
      alert("Please capture an image and connect your wallet before minting.");
      return;
    }
    if (!event?.id) {
      alert("Event not found");
      return;
    }

    try {
      const blobInfo = await storeBlob(imageUrl);
      console.log("Uploaded blob info:", blobInfo);
      if (blobInfo && currentAccount?.address) {
        setIsLoading(true);
        const tx = await mint(blobInfo.blobId, event.id);
        await signAndExecuteTransaction({
          transaction: tx,
        }, {
          onSuccess: (result) => {
            console.log("Transaction successful:", result);
            setTxDigest(result.digest);
            setIsLoading(false);
            setIsModalOpen(true);
            fetchData(); // 直接调用 fetchData 而不是设置 flag
          },
          onError: (error) => {
            console.error("Transaction failed:", error);
            alert("Failed to mint NFT. Please try again.");
            setIsLoading(false);
          }
        });
      }
    } catch (error) {
      console.error('Error in handleMint:', error);
      alert(`Failed to mint NFT: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    if (!client) return; // 确保 client 存在

    try {
      const url = window.location.origin;
      const parsedUrl = getSubdomainAndPath(url);
     //const parsedUrl = getSubdomainAndPath('https://48zr8xtjowbw23lhdy727ef86x14vr6upzwiiiw8b3mwsa8ty2.walrus.site/')
      if (!parsedUrl) {
        
        return;
      }
      
      const objectId = subdomainToObjectId(parsedUrl.subdomain);
      console.log("Object ID:", objectId);
      if (!objectId) {
        
        return;
      } else {
        const event = await getEvent(client, objectId);
        setEvent(event);
        console.log("Event:", event);
      }      
    } catch (err) {
      
    }
    setIsInitialDataFetched(true);
  }, [client]);

  useEffect(() => {
    if (!isInitialDataFetched) {
      fetchData();
    }
  }, [isInitialDataFetched, fetchData]);

  return (
    <div className="bg-gradient-to-b from-blue-500 to-fuchsia-500 min-h-screen w-full p-4 flex flex-col">
      <Card className="flex flex-col flex-grow overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Event Photo Booth : {event?.name}</h1>
          <div className="flex items-center gap-5">
            <Button size="lg" onClick={() => { console.log('Share Event') }} className="w-auto">
              <p>Share Event</p>
            </Button>
            <ConnectButton className="w-full sm:w-44 h-12 sm:h-14 transition-all duration-300 cursor-pointer active:scale-95" />
          </div>
        </div>

        <Tabs defaultValue="camera" className="flex flex-col flex-grow overflow-hidden">
          <TabsList className="w-full">
            <TabsTrigger value="camera" className="w-1/2">Camera</TabsTrigger>
            <TabsTrigger value="gallery" className="w-1/2">Gallery</TabsTrigger>
          </TabsList>
          <TabsContent value="camera" className="flex-grow overflow-hidden">
            <CameraCapture onCapture={handleCapture} isLoading={isLoading || uploading} />
          </TabsContent>
          <TabsContent value="gallery" className="flex-grow overflow-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {event?.blob.map((blob, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0 hover:cursor-pointer hover:scale-105 transition-all duration-300" onClick={() => {
                    window.open(`https://${blob.b36addr}.walrus.site`, '_blank');
                  }}>
                    <Image
                      src={`https://aggregator-devnet.walrus.space/v1/${blob.image_blob}`}
                      alt={`Event image ${index + 1}`}
                      width={300}
                      height={300}
                      className="w-full h-auto object-cover"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
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
