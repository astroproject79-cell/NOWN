declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || '';

export const pageview = (url: string) => {
  if (!GA_ID || typeof window === 'undefined') return;
  window.gtag('config', GA_ID, { page_path: url });
};

export const event = (action: string, params?: Record<string, unknown>) => {
  if (!GA_ID || typeof window === 'undefined') return;
  window.gtag('event', action, params);
};

export const trackPaymentStart = (amount: number, productType: string) => {
  event('begin_checkout', {
    currency: 'KRW',
    value: amount,
    items: [{ item_name: productType }],
  });
};

export const trackPaymentComplete = (orderId: string, amount: number, productType: string) => {
  event('purchase', {
    transaction_id: orderId,
    currency: 'KRW',
    value: amount,
    items: [{ item_name: productType }],
  });
};

export const trackReportView = (reportId: string, reportType: string) => {
  event('view_item', {
    item_id: reportId,
    item_name: reportType,
  });
};

export const trackChatStart = () => {
  event('chat_start');
};

export const trackFortuneComplete = (focusArea: string) => {
  event('fortune_complete', { focus_area: focusArea });
};
