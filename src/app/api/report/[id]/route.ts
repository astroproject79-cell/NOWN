import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    var id = params.id;
    var result = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (!result.data) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    var reportData = result.data;
    if (reportData.user_id) {
      var userResult = await supabaseAdmin
        .from('users')
        .select('name, gender')
        .eq('id', reportData.user_id)
        .single();
      if (userResult.data) {
        reportData.user_name = userResult.data.name;
        reportData.user_gender = userResult.data.gender;
      }
    }

    return NextResponse.json({ success: true, data: reportData });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
