import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    var body = await request.json();
    await supabaseAdmin.from('webhook_logs').insert({
      source: 'ablecity',
      payload: body,
      created_at: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    var text = await request.text();
    await supabaseAdmin.from('webhook_logs').insert({
      source: 'ablecity',
      payload: { raw: text, error: e.message },
      created_at: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  }
}

export async function GET() {
  var result = await supabaseAdmin
    .from('webhook_logs')
    .select('*')
    .eq('source', 'ablecity')
    .order('created_at', { ascending: false })
    .limit(5);
  return NextResponse.json({ data: result.data });
}
