import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Storefront locale routing. Admin auth checks will be added here in the admin phase.
export default createMiddleware(routing);

export const config = {
  // Skip admin (English only), API routes, Next internals and files with an extension.
  matcher: ["/((?!admin|api|_next|_vercel|.*\\..*).*)"],
};
