import { NextRequest } from 'next/server';
import crypto from 'crypto';

var ADMIN_PW = process.env.ADMIN_PASSWORD || 'admin1234';

export function makeAdminToken(pw: string) {
  return crypto.createHash('sha256').update(pw + '_saju_admin').digest('hex').slice(0, 32);
}

export function verifyAdminToken(token: string) {
  return token === makeAdminToken(ADMIN_PW);
}

export function checkAdminAuth(request: NextRequest) {
  var token = request.headers.get('x-admin-token') || '';
  return verifyAdminToken(token);
}

export function loginAdmin(password: string) {
  if (password === ADMIN_PW) {
    return { success: true, token: makeAdminToken(ADMIN_PW) };
  }
  return { success: false, token: '' };
}
