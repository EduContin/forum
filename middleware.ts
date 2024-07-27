import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname;

    // Allow access to login and register pages
    if (path === "/login" || path === "/register") {
      return NextResponse.next();
    }

    // Check if user is authenticated
    const token = req.nextauth.token;
    if (!token) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Allow access to all other pages for authenticated users
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // We'll handle authorization in the middleware function
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
