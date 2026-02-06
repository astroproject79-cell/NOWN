import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function cleanJsonValue(raw: any): string {
  if (!raw) return '';
  if (typeof raw === 'string') {
    try {
      var parsed = JSON.parse(raw);
      if (typeof parsed === 'string') return parsed;
      return String(parsed);
    } catch (e) {
      return raw;
    }
  }
  return String(raw);
}

export async function GET() {
  var botName = '별이';
  var greeting = '안녕하세요, 별이예요. 사주 봐드릴게요.\n\n이름이 어떻게 되세요?';

  try {
    var result = await supabaseAdmin
      .from('admin_settings')
      .select('key, value')
      .in('key', ['bot_name', 'bot_greeting']);

    if (result.data) {
      for (var i = 0; i < result.data.length; i++) {
        var row = result.data[i];
        if (row.key === 'bot_name') {
          botName = cleanJsonValue(row.value) || botName;
        }
        if (row.key === 'bot_greeting') {
          greeting = cleanJsonValue(row.value) || greeting;
        }
      }
    }

    greeting = greeting.replace(/\{name\}/g, botName);
    greeting = greeting.replace(/\\n/g, '\n');

    return NextResponse.json({ success: true, botName: botName, greeting: greeting });
  } catch (e) {
    return NextResponse.json({ success: true, botName: botName, greeting: greeting });
  }
}
