import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { url, timeout } = await req.json();
  if (!url) {
    return NextResponse.json({ status: false, message: 'URL is required', responseTime: 0 }, { status: 400 });
  }
  try {
    const start = Date.now();
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout || 10000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    const responseTime = Date.now() - start;
    return NextResponse.json({
      status: res.ok,
      responseTime,
      message: res.statusText,
      statusCode: res.status,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: false,
      responseTime: 0,
      message: error?.message || 'Test failed',
      statusCode: 0,
    }, { status: 500 });
  }
} 