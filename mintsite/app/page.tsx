'use client'
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { TextArea } from "@radix-ui/themes";
import { useState } from "react";
import { Button } from "../components/Button";
import { ImageDisplay } from "../components/ImageDisplay";
import { isValidSuiAddress } from "@mysten/sui.js/utils";
import Image from "next/image";
import { fakePost } from "./api/generate-image/route";

export default function Home() {
  const currentAccount = useCurrentAccount();
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateImage = async () => {
    if (!description.trim()) {
      alert("Please enter a description first.");
      return;
    }

    setIsLoading(true);
    setImageUrl(''); // Clear the previous image
    try {
      // const response = await fetch('/api/generate-image', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ prompt: description }),
      // });
      // const data = await response.json();

      const data = await fakePost(description);
      if (data.data && data.data[0] && data.data[0].url) {
        setImageUrl(data.data[0].url);
      } else {
        console.error('Unexpected response format:', data);
        alert('Failed to generate image. Please try again.');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('An error occurred while generating the image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[url('/bg.png')] bg-cover bg-center h-screen w-screen p-10 pb-20 flex flex-col justify-between items-center">
      {/* Nav */}
      <nav className="flex justify-between items-center w-full">
        <div className="text-2xl font-bold">
          <Image src="/title.png" alt="Logo" width={300} height={100} />
        </div>
        <ConnectButton className="bg-gradient-to-b w-44 h-14 from-blue-500 to-fuchsia-500 hover:scale-105 transition-all duration-300 cursor-pointer active:scale-95"/>
      </nav>

      <ImageDisplay imageUrl={imageUrl} isLoading={isLoading} />

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
            onClick={generateImage}
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full bg-gradient-to-b from-blue-500 to-fuchsia-200"
          >
            <p className="uppercase font-bold text-white self-center">Create</p>
          </Button>
          <Button
            onClick={() => alert("Minting functionality not implemented yet")}
            disabled={isLoading || !imageUrl || currentAccount?.address === undefined || !isValidSuiAddress(currentAccount?.address)}
            isLoading={false}
            className="w-full bg-gradient-to-b from-fuchsia-200 to-fuchsia-500"
          >
            <p className="uppercase font-bold text-white self-center">Mint</p>
          </Button>
        </div>
      </div>
      <footer className="flex justify-center items-center w-full">
        <p className="text-white">© 2024 Sui Galery</p>
      </footer>
    </div>
  );
}
