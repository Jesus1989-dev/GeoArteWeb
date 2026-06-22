import Link from "next/link";
import { Activity } from "lucide-react";
import { siteConfig } from "@/lib/constants/site";

type AuthShellProps = {
  children: React.ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-br from-slate-100 via-white to-geo-pink/5 dark:from-geo-surface dark:via-background dark:to-geo-pink/10">
      <header className="border-b border-geo-border/80 bg-white/80 px-4 py-4 backdrop-blur sm:px-6 dark:bg-geo-card/80">
        <Link
          href="/"
          className="mx-auto flex max-w-md items-center gap-2.5"
          aria-label={`${siteConfig.name} — inicio`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-geo-navy text-white">
            <Activity size={20} color="#ffffff" strokeWidth={2} aria-hidden />
          </div>
          <span className="font-bold text-geo-navy">{siteConfig.name}</span>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-10 sm:px-6">
        <div className="w-full max-w-md max-h-[calc(100dvh-8rem)]">{children}</div>
      </div>
    </div>
  );
}
