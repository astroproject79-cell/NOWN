import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { checkAdminAuth } from '@/lib/admin';

const propertyId = process.env.GA_PROPERTY_ID;

function getAnalyticsClient() {
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  if (!clientEmail || !privateKey) {
    throw new Error('GA credentials not configured');
  }

  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!propertyId) {
    return NextResponse.json({ error: 'GA not configured' }, { status: 500 });
  }

  try {
    const client = getAnalyticsClient();

    const [realtimeResponse] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }],
    });

    const [reportResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
    });

    const [deviceResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'totalUsers' }],
    });

    const realtime = Number(realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || 0);
    
    const metrics = reportResponse.rows?.[0]?.metricValues || [];
    const visitors = Number(metrics[0]?.value || 0);
    const pageviews = Number(metrics[1]?.value || 0);
    const bounceRate = Math.round(Number(metrics[2]?.value || 0) * 100);
    const avgDuration = Math.round(Number(metrics[3]?.value || 0));

    const devices: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
    deviceResponse.rows?.forEach(row => {
      const device = row.dimensionValues?.[0]?.value?.toLowerCase() || '';
      const users = Number(row.metricValues?.[0]?.value || 0);
      if (device in devices) {
        devices[device] = users;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        realtime,
        visitors,
        pageviews,
        bounceRate,
        avgDuration,
        mobile: devices.mobile,
        desktop: devices.desktop,
        tablet: devices.tablet,
      },
    });
  } catch (error: any) {
    console.error('GA API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch analytics' 
    }, { status: 500 });
  }
}
