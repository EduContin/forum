import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const path = req.nextUrl.pathname;

    // Allow access to public pages without authentication
    if (
      path === "/login" ||
      path === "/register" ||
      path === "/banned" ||
      path === "/winter_soldier.gif"
    ) {
      return NextResponse.next();
    }

    // Check if user is authenticated
    const token = req.nextauth.token;
    if (!token) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check if user is banned
    const username = token.name || token.email;
    try {
      const response = await fetch(
        `${req.nextUrl.origin}/api/v1/users/${username}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();

      if (userData.banned && path !== "/banned") {
        // Redirect to warning page if user is banned and not already on the banned page
        return NextResponse.redirect(new URL("/banned", req.url));
      }
    } catch (error) {
      console.error("Error checking user ban status:", error);
      // In case of an error, allow the request to proceed to avoid potential loops
      return NextResponse.next();
    }

    // Allow access to all other pages for authenticated and non-banned users
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Only proceed with middleware for authenticated users
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
