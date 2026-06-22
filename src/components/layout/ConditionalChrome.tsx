"use client";

import { usePathname } from "next/navigation";
import { isAuthPath } from "@/lib/auth/route-access";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { RequireAuth } from "@/components/layout/RequireAuth";

export function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authRoute = isAuthPath(pathname);

  return (
    <RequireAuth>
      {authRoute ? (
        <>{children}</>
      ) : (
        <>
          <Header />
          <main className="relative z-0 min-w-0 flex-1 overflow-x-clip scroll-mt-14">{children}</main>
          <Footer />
        </>
      )}
    </RequireAuth>
  );
}
