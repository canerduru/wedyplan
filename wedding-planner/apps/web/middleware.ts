import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Simple check for auth token cookie or header
  const token = req.cookies.get('token')?.value;

  if (token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/auth/:path*'],
};
