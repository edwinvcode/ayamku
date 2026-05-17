import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "ayamku-default-secret-ganti-di-production"
);
const COOKIE_NAME = "ayamku-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/login");
  const isApiRoute = pathname.startsWith("/api");
  const isStatic = pathname.startsWith("/_next") || pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/);

  if (isStatic || isApiRoute) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let isValid = false;

  if (token) {
    try {
      await jwtVerify(token, SECRET);
      isValid = true;
    } catch {}
  }

  if (!isValid && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isValid && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
