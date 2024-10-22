import { SuiClient } from "@mysten/sui.js/client";
import { isValidSuiAddress, isValidSuiObjectId, toHEX } from "@mysten/sui.js/utils";
import baseX from "base-x";

const USE_FAKE_API = process.env.NEXT_PUBLIC_USE_FAKE_API === 'true';
const TIMEOUT_DURATION = 60000;
const MAX_RETRIES = 3;

export async function generateImage(prompt: string) {
  if (USE_FAKE_API) {
    return await fakePost(prompt);
  }

  const url = 'https://apikeyplus.com/v1/images/generations';
  const api_key = process.env.NEXT_PUBLIC_DALLE_API_KEY;

  const headers = {
    'Authorization': `Bearer ${api_key}`,
    'Content-Type': 'application/json',
  };

  const payload = {
    "model": "dall-e-3",
    'prompt': prompt,
    'n': 1,
    'quality': "standard",
    'size': '1024x1024'
  };

  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Unexpected response format: ${text}`);
      }
    } catch (error) {
      console.error('Error:', error);
      retries++;
      if (retries >= MAX_RETRIES || (error instanceof Error && error.name !== 'AbortError')) {
        throw error; // 直接抛出错误，不再包装
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  throw new Error('Max retries reached');
}



const BASE36 = "0123456789abcdefghijklmnopqrstuvwxyz";
const b36 = baseX(BASE36);

type Path = {
    subdomain: string;
    path: string;
};

const subdomainToObjectId = (subdomain: string) => {
    const objectId = "0x" + toHEX(b36.decode(subdomain.toLowerCase()));
    console.log(
        "obtained object id: ",
        objectId,
        isValidSuiObjectId(objectId),
        isValidSuiAddress(objectId),
    );
    return isValidSuiObjectId(objectId) ? objectId : null;
}

function removeLastSlash(path: string): string {
    return path.endsWith("/") ? path.slice(0, -1) : path;
}

function getSubdomainAndPath(scope: string): Path | null {
    // At the moment we only support one subdomain level.
    const url = new URL(scope);
    const hostname = url.hostname.split(".");

    if (hostname.length === 3 || (hostname.length === 2 && hostname[1] === "localhost")) {
        // Accept only one level of subdomain eg `subdomain.example.com` or `subdomain.localhost` in
        // case of local development
        const path = url.pathname == "/" ? "/index.html" : removeLastSlash(url.pathname);
        return { subdomain: hostname[0], path } as Path;
    }
    return null;
}

async function getBlob(objectId: string) {
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
    const obj = await client.getObject({
        id: objectId,
        options: { showContent: true },
    });
    return obj;
}

export { subdomainToObjectId, getSubdomainAndPath, getBlob };