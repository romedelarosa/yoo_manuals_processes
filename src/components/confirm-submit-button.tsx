"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ConfirmSubmitButton({
  children,
  confirmMessage,
  className,
}: {
  children: ReactNode;
  confirmMessage: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-md border border-accent bg-white px-4 text-sm font-semibold text-accent transition hover:bg-accent-soft",
        className,
      )}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
