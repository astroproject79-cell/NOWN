import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin';
import { generate, cleanMarkdown } from '@/lib/ai/router';

export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) return NextResponse.json({ success: false }, { status: 401 });

  try {
    var body = await request.json();
    var currentPrompt = body.currentPrompt;
    var userRequest = body.userRequest;
    var model = body.model || 'gpt-4o-mini';

    var result = await generate({
      model: model,
      system: '당신은 사주 리포트 프롬프트 전문가입니다.\n사용자의 요청에 따라 프롬프트를 수정합니다.\n수정된 프롬프트만 출력하세요. 설명은 불필요합니다.',
      prompt: '현재 프롬프트:\n' + currentPrompt + '\n\n수정 요청: ' + userRequest + '\n\n위 요청에 맞게 프롬프트를 수정해주세요.',
      temperature: 0.7,
      maxTokens: 2000,
    });

    return NextResponse.json({
      success: true,
      message: '프롬프트를 수정했습니다.',
      newPrompt: cleanMarkdown(result.content),
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
