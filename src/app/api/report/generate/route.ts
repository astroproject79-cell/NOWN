import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateReportData } from '@/lib/saju/analyzer';
import { generate, getActiveModel } from '@/lib/ai/router';
import { getReportSystemPrompt, getReportSectionPrompts } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    var body = await request.json();
    var userId = body.userId;
    var profileId = body.profileId;
    var orderId = body.orderId;
    var isDemo = body.isDemo || (orderId && orderId.startsWith("DEMO_"));

    if (isDemo && (!userId || userId.startsWith('DEMO_'))) {
      var demoUser = await supabaseAdmin.from('users').insert({
        name: '데모사용자',
        birth_date: '1998-05-11',
        birth_time: '09-11',
        gender: 'female',
        is_lunar: false,
        focus_area: 'all',
      }).select('id').single();
      
      if (demoUser.data) {
        userId = demoUser.data.id;
        
        var demoProfile = await supabaseAdmin.from('saju_profiles').insert({
          user_id: userId,
          year_pillar: '무인',
          month_pillar: '정사',
          day_pillar: '무오',
          hour_pillar: '정사',
          day_master: '무',
          day_master_element: '토',
          five_elements: { '목': 1, '화': 5, '토': 2, '금': 0, '수': 0 },
          raw_data: {},
        }).select('id').single();
        
        if (demoProfile.data) {
          profileId = demoProfile.data.id;
        }
      }
    }

    if (!userId || !profileId) {
      return NextResponse.json({ success: false, error: '필수 정보가 누락되었습니다' }, { status: 400 });
    }

    var paymentCheck = await supabaseAdmin
      .from('payments')
      .select('id, status')
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!isDemo && !paymentCheck.data) {
      return NextResponse.json({ success: false, error: '결제 내역을 확인할 수 없습니다' }, { status: 403 });
    }

    var paymentId = isDemo ? "DEMO" : (paymentCheck.data ? paymentCheck.data.id : null);

    var existingReport = await supabaseAdmin
      .from('reports')
      .select('id')
      .eq('user_id', userId)
      .eq('saju_profile_id', profileId)
      .eq('status', 'completed')
      .maybeSingle();

    if (existingReport.data && !isDemo) {
      return NextResponse.json({
        success: true,
        reportId: existingReport.data.id,
        cached: true,
      });
    }

    var profileResult = await supabaseAdmin
      .from('saju_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    var profile = profileResult.data;
    
    if (!profile && isDemo) {
      profile = {
        year_pillar: '무인',
        month_pillar: '정사',
        day_pillar: '무오',
        hour_pillar: '정사',
        day_master: '무',
        day_master_element: '토',
        five_elements: { '목': 1, '화': 5, '토': 2, '금': 0, '수': 0 },
      };
    }
    
    if (!profile) {
      return NextResponse.json({ success: false, error: '사주 프로필을 찾을 수 없습니다' }, { status: 404 });
    }
    var yearP = profile.year_pillar;
    var monthP = profile.month_pillar;
    var dayP = profile.day_pillar;
    var hourP = profile.hour_pillar;

    var reportData: any;
    try {
      reportData = generateReportData(yearP, monthP, dayP, hourP);
    } catch (e) {
      reportData = {
        fourPillars: {
          year: { stem: yearP[0], branch: yearP[1], hanja: yearP },
          month: { stem: monthP[0], branch: monthP[1], hanja: monthP },
          day: { stem: dayP[0], branch: dayP[1], hanja: dayP },
          hour: { stem: hourP[0], branch: hourP[1], hanja: hourP },
        },
        dayMaster: { char: dayP[0], element: profile.day_master_element || '', strength: 'neutral', score: 50 },
        elements: profile.five_elements || {},
        summary: [],
      };
    }

    var model = await getActiveModel('report');
    var systemPrompt = await getReportSystemPrompt();
    var sectionPrompts = await getReportSectionPrompts();

    var sajuContext = JSON.stringify(reportData, null, 2);

    var userResult = await supabaseAdmin
      .from('users')
      .select('name, birth_date, gender, focus_area')
      .eq('id', userId)
      .single();

    var userInfo = userResult.data || {};

    var sections: Record<string, string> = {};
    var promises = sectionPrompts.map(function(section) {
      var prompt = [
        '사용자 정보: ' + JSON.stringify(userInfo),
        '',
        '사주 분석 데이터:',
        sajuContext,
        '',
        '섹션: ' + section.title,
        section.instruction,
        '',
        '최소 1,500자 이상으로 상세하게 작성해주세요.',
      ].join('\n');

      return generate({
        model: model,
        system: systemPrompt,
        prompt: prompt,
        temperature: 0.7,
        maxTokens: 3000,
      }).then(function(res) {
        sections[section.key] = res.content;
        return { key: section.key, chars: res.content.length, tokens: res.tokens };
      }).catch(function(e) {
        sections[section.key] = section.title + ' 분석 중 오류가 발생했습니다. 다시 시도해주세요.';
        return { key: section.key, chars: 0, error: e.message };
      });
    });

    var results = await Promise.all(promises);

    var totalChars = 0;
    for (var k in sections) {
      totalChars += sections[k].length;
    }

    var reportInsert = await supabaseAdmin.from('reports').insert({
      user_id: userId,
      saju_profile_id: profileId,
      type: 'premium',
      sections: sections,
      saju_data: reportData,
      model: model,
      status: 'completed',
      total_chars: totalChars,
    }).select('id').single();

    if (reportInsert.error) {
      console.error("Report insert error:", reportInsert.error);
      return NextResponse.json({ success: false, error: "리포트 저장 실패: " + reportInsert.error.message }, { status: 500 });
    }
    var reportId = reportInsert.data?.id;

    if (reportId && paymentId) {
      await supabaseAdmin
        .from('payments')
        .update({ report_id: reportId })
        .eq('id', paymentId);
    }

    return NextResponse.json({
      success: true,
      reportId: reportId,
      totalChars: totalChars,
      sectionResults: results,
    });
  } catch (e: any) {
    console.error('Report generation error:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
