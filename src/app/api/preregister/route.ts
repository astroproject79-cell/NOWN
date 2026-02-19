import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: '유효한 이메일을 입력해주세요' }, { status: 400 });
    }
    const { data: existing } = await supabaseAdmin
      .from('preregistrations')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single();
    if (existing) {
      return NextResponse.json({ success: true, message: '이미 등록된 이메일입니다' });
    }
    const { error } = await supabaseAdmin
      .from('preregistrations')
      .insert({ email: email.trim().toLowerCase(), registered_at: new Date().toISOString(), source: 'landing' });
    if (error) {
      console.error('Preregistration error:', error);
      return NextResponse.json({ success: false, error: '등록 중 오류가 발생했습니다' }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: '사전등록이 완료되었습니다' });
  } catch (err) {
    console.error('Preregistration error:', err);
    return NextResponse.json({ success: false, error: '서버 오류' }, { status: 500 });
  }
}
