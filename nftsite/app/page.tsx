'use client'
import { getBlob, getSubdomainAndPath, subdomainToObjectId } from "@/utils";
import { ConnectButton } from "@mysten/dapp-kit";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const url = window.location.origin;
      const parsedUrl = getSubdomainAndPath(url);
      // const parsedUrl = getSubdomainAndPath('https://1bud1i6g0jem5h8sgki57snx2m9lvh8cr4h1ondwhznp0shgao.walrus.site/')
      if (!parsedUrl) {
        setError("Invalid URL or subdomain not found");
        return;
      }
      
      const objectId = subdomainToObjectId(parsedUrl.subdomain);
      if (!objectId) {
        setError("Invalid object ID");
        return;
      }
      const obj = await getBlob(objectId);
      const result = obj.data?.content as unknown as {fields: {image_blob: string}};
      setBlobUrl(`https://aggregator-devnet.walrus.space/v1/${result.fields.image_blob}`);
    } catch (err) {
      setError("An error occurred while fetching data");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <div className="mb-4">
          <ConnectButton />
        </div>
        {error ? (
          <div className="text-red-500 text-center mb-4">{error}</div>
        ) : blobUrl ? (
          <img src={blobUrl} alt="NFT" className="w-full h-auto rounded-lg shadow-sm" />
        ) : (
          <div className="text-center text-gray-500">Loading...</div>
        )}
      </div>
    </div>
  );
}
