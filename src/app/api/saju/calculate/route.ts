import { NextRequest, NextResponse } from 'next/server';
import { calculateSaju, DAY_MASTER_INFO } from '@/lib/saju/engine';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = body.name;
    const birthDate = body.birthDate;
    const birthTime = body.birthTime;
    const gender = body.gender;
    const isLunar = body.isLunar;
    const focusArea = body.focusArea;

    if (!name || !birthDate) {
      return NextResponse.json({ success: false, error: '필수 정보 누락' }, { status: 400 });
    }

    const calendar = isLunar ? 'lunar' : 'solar';
    const result = await calculateSaju(birthDate, birthTime || 'unknown', calendar);

    const insertUser = await supabaseAdmin
      .from('users')
      .insert({
        name: name,
        birth_date: birthDate,
        birth_time: birthTime || 'unknown',
        gender: gender,
        is_lunar: isLunar || false,
        focus_area: focusArea || 'all',
      })
      .select('id')
      .single();

    if (insertUser.error) throw insertUser.error;
    const userId = insertUser.data.id;

    const insertProfile = await supabaseAdmin
      .from('saju_profiles')
      .insert({
        user_id: userId,
        year_pillar: result.yearPillar,
        month_pillar: result.monthPillar,
        day_pillar: result.dayPillar,
        hour_pillar: result.hourPillar,
        day_master: result.dayMaster,
        day_master_element: result.dayMasterElement,
        five_elements: result.elements,
        raw_data: result,
      })
      .select('id')
      .single();

    if (insertProfile.error) throw insertProfile.error;
    const profileId = insertProfile.data.id;

    const dmInfo = DAY_MASTER_INFO[result.dayMaster];
    const hp = result.hourPillar;

    return NextResponse.json({
      success: true,
      data: {
        userId: userId,
        profileId: profileId,
        fourPillars: {
          year: { text: result.yearPillar, stem: result.yearPillar[0], branch: result.yearPillar[1] },
          month: { text: result.monthPillar, stem: result.monthPillar[0], branch: result.monthPillar[1] },
          day: { text: result.dayPillar, stem: result.dayPillar[0], branch: result.dayPillar[1] },
          hour: { text: hp, stem: hp !== '미상' ? hp[0] : '?', branch: hp !== '미상' ? hp[1] : '?' },
        },
        dayMaster: {
          char: result.dayMaster,
          element: dmInfo ? dmInfo.element : '',
          nature: dmInfo ? dmInfo.nature : '',
          personality: dmInfo ? dmInfo.personality : '',
          color: dmInfo ? dmInfo.color : '#fff',
        },
        fiveElements: result.elements,
        focusArea: focusArea || 'all',
      },
    });
  } catch (err) {
    console.error('Saju calc error:', err);
    return NextResponse.json({ success: false, error: '계산 오류', detail: JSON.stringify(err, Object.getOwnPropertyNames(err)) }, { status: 500 });
  }
}
