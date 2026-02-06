import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/admin';

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) return NextResponse.json({ success: false }, { status: 401 });

  var usersResult = await supabaseAdmin.from('users').select('id', { count: 'exact', head: true });
  var reportsResult = await supabaseAdmin.from('reports').select('id', { count: 'exact', head: true });
  var paymentsResult = await supabaseAdmin.from('payments').select('amount').eq('status', 'confirmed');

  var revenue = 0;
  if (paymentsResult.data) {
    for (var i = 0; i < paymentsResult.data.length; i++) {
      revenue += paymentsResult.data[i].amount || 0;
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      users: usersResult.count || 0,
      reports: reportsResult.count || 0,
      payments: paymentsResult.data ? paymentsResult.data.length : 0,
      revenue: revenue,
    },
  });
}
