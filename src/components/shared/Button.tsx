import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "outline-navy" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

const variants = {
  primary:
    "bg-geo-pink text-white hover:bg-geo-pink-hover shadow-sm",
  secondary:
    "bg-geo-navy text-white hover:bg-geo-navy-dark shadow-sm",
  outline:
    "border border-geo-pink text-geo-pink hover:bg-geo-pink/5",
  "outline-navy":
    "border border-geo-navy text-geo-navy hover:bg-geo-navy/5",
  ghost: "text-geo-muted hover:text-geo-navy hover:bg-geo-surface",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm font-medium",
  lg: "px-6 py-3 text-base font-medium",
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  onClick,
  disabled = false,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg transition-colors",
    variants[variant],
    sizes[size],
    disabled && "pointer-events-none opacity-50",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
