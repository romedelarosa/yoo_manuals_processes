import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "accent";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "border-border bg-surface-muted text-muted",
        tone === "success" && "border-[#b6dec5] bg-[#e7f6eb] text-success",
        tone === "warning" && "border-[#efd09a] bg-[#fff6dc] text-warning",
        tone === "accent" && "border-[#f1c5b5] bg-accent-soft text-accent",
      )}
    >
      {children}
    </span>
  );
}

export function ButtonLink({
  children,
  className,
  variant = "primary",
  ...props
}: ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition",
        variant === "primary" &&
          "bg-primary text-primary-foreground shadow-sm hover:bg-[#0b4d3c]",
        variant === "secondary" &&
          "border border-border bg-surface text-foreground hover:border-primary",
        variant === "ghost" && "text-muted hover:bg-surface-muted hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-surface shadow-[0_10px_28px_rgba(35,48,38,0.06)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex max-w-3xl flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm leading-6 text-muted">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="text-sm font-medium text-foreground">{children}</label>;
}

export function TextInput(props: ComponentProps<"input">) {
  return (
    <input
      className="min-h-11 rounded-md border border-border bg-white px-3 text-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-[#cfe9dc]"
      {...props}
    />
  );
}

export function SelectInput(props: ComponentProps<"select">) {
  return (
    <select
      className="min-h-11 rounded-md border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-[#cfe9dc]"
      {...props}
    />
  );
}

export function TextArea(props: ComponentProps<"textarea">) {
  return (
    <textarea
      className="min-h-28 rounded-md border border-border bg-white px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-[#cfe9dc]"
      {...props}
    />
  );
}
