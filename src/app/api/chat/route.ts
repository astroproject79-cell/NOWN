import { NextRequest } from 'next/server';
import { streamGenerate, getActiveModel, cleanMarkdown } from '@/lib/ai/router';
import { supabaseAdmin } from '@/lib/supabase';
import { calculateSaju, DAY_MASTER_INFO } from '@/lib/saju/engine';
import { getChatPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    var body = await request.json();
    var message = body.message;
    var history = body.history;
    var sessionId = body.sessionId;
    var sajuData = body.sajuData;

    var model = await getActiveModel('chat');
    var systemPrompt = await getChatPrompt();

    if (sajuData) {
      systemPrompt += '\n\n[퀵사주에서 넘어온 데이터]\n' + JSON.stringify(sajuData);
    }

    var collectedInfo = extractInfoFromHistory(history || [], message);

    if (collectedInfo.ready && !sajuData) {
      try {
        var calcResult = await calculateSaju(
          collectedInfo.birthDate,
          collectedInfo.birthTime || 'unknown',
          'solar'
        );
        var dmInfo = DAY_MASTER_INFO[calcResult.dayMaster];
        systemPrompt += '\n\n[실시간 사주 계산 결과]';
        systemPrompt += '\n사주: ' + calcResult.yearPillar + ' ' + calcResult.monthPillar + ' ' + calcResult.dayPillar + ' ' + calcResult.hourPillar;
        systemPrompt += '\n일간: ' + calcResult.dayMaster + ' (' + (dmInfo ? dmInfo.element + ', ' + dmInfo.nature : '') + ')';
        systemPrompt += '\n성격: ' + (dmInfo ? dmInfo.personality : '');
        systemPrompt += '\n오행: ' + JSON.stringify(calcResult.elements);
        systemPrompt += '\n\n이 데이터를 기반으로 구체적인 사주 인사이트를 제공해. 뻔한 말 말고 이 사람 사주에서 실제로 보이는 것만 말해.';
      } catch (e) {
        systemPrompt += '\n\n(사주 계산 실패 - 일반적인 인사이트로 대체)';
      }
    }

    var chatMessages: Array<{ role: string; content: string }> = [];
    if (history && Array.isArray(history)) {
      for (var i = 0; i < history.length; i++) {
        chatMessages.push({ role: history[i].role, content: history[i].content });
      }
    }
    chatMessages.push({ role: 'user', content: message });

    var result = await streamGenerate({
      model: model,
      system: systemPrompt,
      messages: chatMessages,
      temperature: 0.8,
      maxTokens: 600,
    });

    var encoder = new TextEncoder();

    var readable = new ReadableStream({
      async start(controller) {
        var fullContent = '';
        try {
          if (result.type === 'openai') {
            for await (var chunk of result.stream) {
              var delta = chunk.choices[0];
              var text = delta && delta.delta && delta.delta.content ? delta.delta.content : '';
              if (text) {
                fullContent += text;
                controller.enqueue(encoder.encode('data: ' + JSON.stringify({ text: text }) + '\n\n'));
              }
            }
          }

          if (result.type === 'anthropic') {
            for await (var event of result.stream) {
              if (event.type === 'content_block_delta') {
                var aText = (event.delta as any).text || '';
                if (aText) {
                  fullContent += aText;
                  controller.enqueue(encoder.encode('data: ' + JSON.stringify({ text: aText }) + '\n\n'));
                }
              }
            }
          }

          if (result.type === 'gemini') {
            for await (var gChunk of result.stream.stream) {
              var gText = gChunk.text();
              if (gText) {
                fullContent += gText;
                controller.enqueue(encoder.encode('data: ' + JSON.stringify({ text: gText }) + '\n\n'));
              }
            }
          }

          fullContent = cleanMarkdown(fullContent);
          controller.enqueue(encoder.encode('data: ' + JSON.stringify({ done: true }) + '\n\n'));

          if (sessionId) {
            var allMessages = history ? history.slice() : [];
            allMessages.push({ role: 'user', content: message });
            allMessages.push({ role: 'assistant', content: fullContent });
            await supabaseAdmin
              .from('chat_sessions')
              .update({ messages: allMessages, updated_at: new Date().toISOString() })
              .eq('id', sessionId);
          }
        } catch (e) {
          controller.enqueue(encoder.encode('data: ' + JSON.stringify({ error: 'stream failed' }) + '\n\n'));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('Chat error:', err);
    return Response.json({ success: false, error: '응답 생성 실패' }, { status: 500 });
  }
}

function extractInfoFromHistory(history: any[], currentMsg: string) {
  var allText = '';
  for (var i = 0; i < history.length; i++) {
    allText += ' ' + history[i].content;
  }
  allText += ' ' + currentMsg;

  var dateMatch = allText.match(/(\d{4})[-./]?(\d{1,2})[-./]?(\d{1,2})/);
  var birthDate = dateMatch ? dateMatch[1] + '-' + dateMatch[2].padStart(2, '0') + '-' + dateMatch[3].padStart(2, '0') : '';

  var timeMatch = allText.match(/(\d{1,2})[:\s시](\d{0,2})/);
  var birthTime = '';
  if (timeMatch) {
    var h = parseInt(timeMatch[1]);
    if (allText.includes('오후') || allText.includes('pm')) h += 12;
    if (h === 0 || h === 24) birthTime = '23-01';
    else if (h <= 2) birthTime = '01-03';
    else if (h <= 4) birthTime = '03-05';
    else if (h <= 6) birthTime = '05-07';
    else if (h <= 8) birthTime = '07-09';
    else if (h <= 10) birthTime = '09-11';
    else if (h <= 12) birthTime = '11-13';
    else if (h <= 14) birthTime = '13-15';
    else if (h <= 16) birthTime = '15-17';
    else if (h <= 18) birthTime = '17-19';
    else if (h <= 20) birthTime = '19-21';
    else birthTime = '21-23';
  }

  var hasGender = /여|남|여자|남자|여성|남성|female|male/.test(allText);
  var hasFocus = /연애|돈|재물|직업|건강|결혼|사업|이직|운세|관계/.test(allText);

  var ready = birthDate.length > 0 && hasGender && hasFocus;

  return { birthDate: birthDate, birthTime: birthTime, ready: ready };
}
