"use client";

import {
  BookOpenCheck,
  Building2,
  ClipboardList,
  FileText,
  Gauge,
  Layers3,
  LockKeyhole,
  Network,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const employeeNav = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/progress", label: "My Progress", icon: ClipboardList },
  { href: "/modules/appointment-blueprint", label: "Blueprint", icon: Network },
];

const adminNav = [
  { href: "/admin", label: "Admin", icon: Shield },
  { href: "/admin/employees", label: "Employees", icon: Users },
  { href: "/admin/roles", label: "Roles", icon: Building2 },
  { href: "/admin/modules", label: "Modules", icon: Layers3 },
  { href: "/admin/assignments", label: "Assignments", icon: BookOpenCheck },
  { href: "/admin/reports", label: "Reports", icon: FileText },
];

export function AppShell({
  children,
  mode = "employee",
}: {
  children: ReactNode;
  mode?: "employee" | "admin";
}) {
  const pathname = usePathname();
  const navItems = mode === "admin" ? adminNav : employeeNav;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-border bg-[#fbfcf8] px-5 py-6 lg:flex lg:flex-col">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LockKeyhole />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              Internal
            </p>
            <p className="text-base font-semibold text-foreground">Manual System</p>
          </div>
        </Link>

        <div className="mt-8 rounded-lg border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Active scope
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            YOO Clinic + ORI Wellness
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Access is scoped by business and role, with Supabase RLS policies
            enforcing database-level protection.
          </p>
        </div>

        <nav className="mt-7 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:bg-surface-muted hover:text-foreground",
                )}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg bg-[#17211b] p-4 text-white">
          <p className="text-sm font-semibold">Protected by design</p>
          <p className="mt-1 text-xs leading-5 text-white/70">
            No public policy pages, no broad downloads, and access is intended
            to be enforced at the database layer.
          </p>
          <form action="/auth/signout" method="post" className="mt-4">
            <button className="min-h-9 rounded-md border border-white/20 px-3 text-xs font-semibold text-white transition hover:bg-white/10">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-border bg-[#fbfcf8]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="font-semibold">
            Manual System
          </Link>
          <Link
            href={mode === "admin" ? "/dashboard" : "/admin"}
            className="rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold"
          >
            {mode === "admin" ? "Employee" : "Admin"}
          </Link>
        </div>
      </header>

      <main className="lg:pl-72">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
