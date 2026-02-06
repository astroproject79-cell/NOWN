import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/admin';

var PUBLIC_KEYS = ['premium_price', 'consult_price', 'bot_name', 'bot_greeting'];

function cleanValue(raw: any): any {
  if (raw === null || raw === undefined) return raw;
  if (typeof raw !== 'string') return raw;
  var str = raw;
  var maxDepth = 5;
  for (var i = 0; i < maxDepth; i++) {
    try {
      var parsed = JSON.parse(str);
      if (typeof parsed === 'string' && parsed !== str) {
        str = parsed;
      } else {
        return parsed;
      }
    } catch (e) {
      return str;
    }
  }
  return str;
}

export async function GET(request: NextRequest) {
  var isAdmin = checkAdminAuth(request);

  var result = await supabaseAdmin.from('admin_settings').select('key, value');
  var settings: Record<string, any> = {};

  if (result.data) {
    for (var i = 0; i < result.data.length; i++) {
      var row = result.data[i];
      if (!isAdmin && PUBLIC_KEYS.indexOf(row.key) < 0) continue;
      settings[row.key] = cleanValue(row.value);
    }
  }

  return NextResponse.json({ success: true, data: settings });
}

export async function PUT(request: NextRequest) {
  if (!checkAdminAuth(request)) return NextResponse.json({ success: false }, { status: 401 });

  try {
    var body = await request.json();
    var entries = Object.entries(body);
    var errors: string[] = [];

    for (var i = 0; i < entries.length; i++) {
      var key = entries[i][0];
      var value = entries[i][1];
      var jsonValue = JSON.stringify(value);

      var res = await supabaseAdmin
        .from('admin_settings')
        .upsert(
          { key: key, value: jsonValue, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );

      if (res.error) {
        errors.push(key + ': ' + res.error.message);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors: errors });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
