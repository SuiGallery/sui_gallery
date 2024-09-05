import { NextResponse } from 'next/server';
import { fakePost } from '../../../mock';

const USE_FAKE_API = process.env.NEXT_PUBLIC_USE_FAKE_API === 'true';

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
    'quality': "hd",
    'size': '1792x1024'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}