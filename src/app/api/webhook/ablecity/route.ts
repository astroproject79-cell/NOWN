import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    var body = await request.json();
    console.log('=== ABLECITY WEBHOOK ===');
    console.log(JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.log('=== ABLECITY WEBHOOK RAW ===');
    var text = await request.text();
    console.log(text);
    return NextResponse.json({ success: true });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'webhook ready' });
}
