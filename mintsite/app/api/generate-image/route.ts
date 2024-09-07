'use server'
import { NextResponse } from 'next/server';
import { fakePost } from '../../../mock';

const USE_FAKE_API = process.env.NEXT_PUBLIC_USE_FAKE_API === 'true';
const TIMEOUT_DURATION = 60000;
const MAX_RETRIES = 3;

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (USE_FAKE_API) {
    const fakeData = await fakePost(prompt);
    return NextResponse.json(fakeData);
  }

  const url = 'https://apikeyplus.com/v1/images/generations';
  const api_key = process.env.DALLE_API_KEY;

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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error:', error);
      retries++;
      if (retries >= MAX_RETRIES || (error instanceof Error && error.name !== 'AbortError')) {
        return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
      }
      // 如果是超时错误，等待一段时间后重试
      //await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  return NextResponse.json({ error: 'Max retries reached' }, { status: 504 });
}