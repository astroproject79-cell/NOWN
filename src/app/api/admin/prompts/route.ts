import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/admin';
import { getDefaults, clearPromptCache } from '@/lib/prompts';

var PROMPT_KEYS = ['chat_system_prompt', 'report_system_prompt', 'report_section_prompts'];

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) return NextResponse.json({ success: false }, { status: 401 });

  var defaults = getDefaults();
  var prompts: Record<string, any> = {};

  var result = await supabaseAdmin
    .from('admin_settings')
    .select('key, value')
    .in('key', PROMPT_KEYS);

  var dbMap: Record<string, any> = {};
  if (result.data) {
    for (var i = 0; i < result.data.length; i++) {
      var row = result.data[i];
      try {
        dbMap[row.key] = JSON.parse(row.value);
      } catch (e) {
        dbMap[row.key] = row.value;
      }
    }
  }

  for (var k = 0; k < PROMPT_KEYS.length; k++) {
    var key = PROMPT_KEYS[k];
    prompts[key] = {
      value: dbMap[key] || (defaults as any)[key],
      isDefault: !dbMap[key],
    };
  }

  return NextResponse.json({ success: true, data: prompts });
}

export async function PUT(request: NextRequest) {
  if (!checkAdminAuth(request)) return NextResponse.json({ success: false }, { status: 401 });

  try {
    var body = await request.json();
    var errors: string[] = [];

    var entries = Object.entries(body);
    for (var i = 0; i < entries.length; i++) {
      var key = entries[i][0];
      var value = entries[i][1];

      if (PROMPT_KEYS.indexOf(key) < 0) {
        errors.push(key + ': invalid key');
        continue;
      }

      var jsonValue = typeof value === 'string' ? JSON.stringify(value) : JSON.stringify(value);

      var res = await supabaseAdmin
        .from('admin_settings')
        .upsert(
          { key: key, value: jsonValue, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );

      if (res.error) errors.push(key + ': ' + res.error.message);
    }

    clearPromptCache();

    if (errors.length > 0) return NextResponse.json({ success: false, errors: errors });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAdminAuth(request)) return NextResponse.json({ success: false }, { status: 401 });

  try {
    var body = await request.json();
    var key = body.key;

    if (!key || PROMPT_KEYS.indexOf(key) < 0) {
      return NextResponse.json({ success: false, error: 'invalid key' }, { status: 400 });
    }

    await supabaseAdmin.from('admin_settings').delete().eq('key', key);
    clearPromptCache();

    return NextResponse.json({ success: true, message: key + ' reset to default' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
