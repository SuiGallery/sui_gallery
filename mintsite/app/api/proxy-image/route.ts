'use server'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const contentType = response.headers.get('content-type');
    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/octet-stream'
      }
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 });
  }
}