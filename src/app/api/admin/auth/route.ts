import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin, verifyAdminToken } from '@/lib/admin';

export async function POST(request: NextRequest) {
  var body = await request.json();

  if (body.token) {
    return NextResponse.json({ success: verifyAdminToken(body.token) });
  }

  var result = loginAdmin(body.password || '');
  if (result.success) {
    return NextResponse.json({ success: true, token: result.token });
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
