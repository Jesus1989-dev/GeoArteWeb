import { CheckCircle2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthStatusCardProps = {
  variant: "success" | "info";
  titulo: string;
  texto: string;
  children?: React.ReactNode;
};

export function AuthStatusCard({
  variant,
  titulo,
  texto,
  children,
}: AuthStatusCardProps) {
  const Icon = variant === "success" ? CheckCircle2 : Mail;
  const wrapClass =
    variant === "success"
      ? "border-emerald-200 bg-emerald-50"
      : "border-sky-200 bg-sky-50";

  return (
    <div className={`rounded-xl border p-5 ${wrapClass}`}>
      <div className="flex gap-3">
        <Icon
          size={24}
          strokeWidth={2}
          className={cn(
            "shrink-0",
            variant === "success" ? "text-geo-pink" : "text-geo-navy",
          )}
          aria-hidden
        />
        <div className="min-w-0">
          <p className="font-semibold text-geo-navy">{titulo}</p>
          <p className="mt-1 text-sm leading-relaxed text-geo-muted">{texto}</p>
          {children != null && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </div>
  );
}
