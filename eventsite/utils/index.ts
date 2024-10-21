import { fakePost } from '../mock';

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