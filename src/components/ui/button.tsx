import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  gold:
    "bg-gold text-gold-foreground hover:bg-[#e0a61f] font-bold",
  purple:
    "bg-brand text-white hover:bg-[#7a2bc0] font-bold",
  outline:
    "border border-white/20 bg-transparent text-white hover:border-gold hover:text-gold",
  ghost: "text-white/80 hover:text-white",
};

const sizes = {
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-8 text-base",
};

type ButtonProps = {
  href?: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({
  href,
  variant = "gold",
  size = "md",
  className,
  children,
  type = "button",
  disabled,
  onClick,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-md tracking-wide uppercase transition disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
  if (href) {
    const external = /^(https?:|tel:|sms:|mailto:)/.test(href);
    if (external) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
