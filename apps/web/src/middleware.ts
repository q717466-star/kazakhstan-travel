import { NextRequest, NextResponse } from 'next/server';
import {
  DESIGN_COOKIE,
  DESIGN_HEADER,
  isAcceptedDesignInput,
  parseDesign,
} from './lib/design-theme';

export function middleware(request: NextRequest) {
  const queryDesign = request.nextUrl.searchParams.get('design');
  const cookieDesign = request.cookies.get(DESIGN_COOKIE)?.value;

  const hasValidQuery = isAcceptedDesignInput(queryDesign);
  const hasValidCookie = isAcceptedDesignInput(cookieDesign);

  if (!hasValidQuery && !hasValidCookie) {
    return NextResponse.next();
  }

  const resolvedDesign = hasValidQuery ? parseDesign(queryDesign) : parseDesign(cookieDesign);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(DESIGN_HEADER, resolvedDesign);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (hasValidQuery && cookieDesign !== resolvedDesign) {
    response.cookies.set(DESIGN_COOKIE, resolvedDesign, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|videos|brand|admin).*)'],
};
