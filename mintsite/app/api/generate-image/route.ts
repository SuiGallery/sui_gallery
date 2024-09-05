import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const url = 'https://apikeyplus.com/v1/images/generations';
  const api_key = process.env.DALLE_API_KEY; // 将API密钥存储在环境变量中

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
