import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    var body = await request.json();
    var paymentKey = body.paymentKey;
    var orderId = body.orderId;
    var amount = body.amount;
    var userId = body.userId;

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ success: false, error: '결제 정보가 누락되었습니다' }, { status: 400 });
    }

    var secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      console.error('[Payment] TOSS_SECRET_KEY not configured');
      return NextResponse.json({ success: false, error: '결제 시스템 설정 오류' }, { status: 500 });
    }

    var priceResult = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', 'premium_price')
      .single();

    var dbPrice = 19900;
    if (priceResult.data && priceResult.data.value) {
      var parsed = priceResult.data.value;
      try { parsed = JSON.parse(parsed); } catch (e) {}
      dbPrice = Number(parsed) || 19900;
    }

    if (Number(amount) !== dbPrice) {
      console.error('[Payment] Amount mismatch:', amount, 'vs DB:', dbPrice);
      return NextResponse.json({ success: false, error: '결제 금액이 일치하지 않습니다' }, { status: 400 });
    }

    var dupCheck = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', 'confirmed')
      .maybeSingle();

    if (dupCheck.data) {
      return NextResponse.json({ success: false, error: '이미 처리된 결제입니다' }, { status: 409 });
    }

    var auth = Buffer.from(secretKey + ':').toString('base64');

    var res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey: paymentKey, orderId: orderId, amount: Number(amount) }),
    });

    var data = await res.json();

    if (!res.ok) {
      if (userId) {
        await supabaseAdmin.from('payments').insert({
          user_id: userId,
          order_id: orderId,
          payment_key: paymentKey,
          amount: Number(amount),
          status: 'failed',
          product_type: 'premium_report',
        });
      }
      return NextResponse.json({ success: false, error: data.message || '결제 확인 실패' }, { status: 400 });
    }

    var paymentInsert = await supabaseAdmin.from('payments').insert({
      user_id: userId || null,
      order_id: orderId,
      payment_key: paymentKey,
      amount: Number(amount),
      status: 'confirmed',
      product_type: 'premium_report',
    }).select('id').single();

    var paymentId = paymentInsert.data?.id || null;

    return NextResponse.json({
      success: true,
      paymentId: paymentId,
      data: { orderId: data.orderId, totalAmount: data.totalAmount, method: data.method },
    });
  } catch (e: any) {
    console.error('[Payment] Confirm error:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
