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
    'quality': "standard",
    'size': '1024x1024'
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

const sampleImages = [
  '/sample1.jpg',
  '/sample2.jpg',
  '/sample3.jpg',
];

export async function fakePost(prompt: string): Promise<{ data: { url: string }[] }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Randomly select an image
  const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];

  return {
    data: [{ url: randomImage }]
  };
}
