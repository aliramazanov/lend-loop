import { ConvexClientProvider } from "@/components/layout/ConvexClientProvider";
import { SkipLink } from "@/components/layout/SkipLink";
import { SITE_NAME, TAGLINE } from "@/lib/site";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import type { RootLayoutProps } from "@/types";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | Neighborhood Tool Lending`,
    template: `%s | ${SITE_NAME}`,
  },
  description: TAGLINE,
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider appearance={{ options: { shimmer: false } }}>
      <html lang="en" className="motion-safe:scroll-smooth">
        <body className="min-h-screen antialiased selection:bg-emerald-100">
          <SkipLink />
          <ConvexClientProvider>{children}</ConvexClientProvider>
          <Toaster theme="light" richColors closeButton position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
