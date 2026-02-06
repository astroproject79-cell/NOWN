import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { name, birth, hour, gender, calendar, concern } = await request.json();

    if (!name || !birth || !gender) {
      return NextResponse.json({ success: false, error: '필수 항목 누락' }, { status: 400 });
    }

    const userId = randomUUID();

    // TODO: Supabase 연동 시 아래 코드 활성화
    // const { error } = await supabaseAdmin.from('users').insert({
    //   id: userId, name, birth_date: birth, birth_hour: hour || 'unknown',
    //   gender, calendar_type: calendar || 'solar', primary_concern: concern,
    // });

    return NextResponse.json({
      success: true,
      data: { userId },
    });
  } catch (error) {
    console.error('User create error:', error);
    return NextResponse.json({ success: false, error: '서버 오류' }, { status: 500 });
  }
}
