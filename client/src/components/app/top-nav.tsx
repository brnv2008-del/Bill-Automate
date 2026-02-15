import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, Sparkles } from "lucide-react";

const nav = [
  { href: "/app", label: "Dashboard", testId: "link-nav-dashboard" },
  { href: "/app/manual-entry", label: "Manual Entry", testId: "link-nav-manual-entry" },
  { href: "/app/smart-dump", label: "Smart Dump", testId: "link-nav-smart-dump" },
  { href: "/app/extraction", label: "Extraction", testId: "link-nav-extraction" },
  { href: "/app/reports", label: "Reports", testId: "link-nav-reports" },
  { href: "/app/workflow", label: "Workflow", testId: "link-nav-workflow" },
];

export default function TopNav() {
  const [location] = useLocation();

  return (
    <div className="sticky top-0 z-40 -mx-4 mb-6 border-b bg-background/70 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,hsl(200_94%_44%)_45%,hsl(216_92%_52%/0.1)_100%)] shadow-xs ag-noise" />
            <div className="hidden sm:block">
              <div className="text-sm font-semibold leading-tight" data-testid="text-nav-title">AutoGST Billing</div>
              <div className="text-xs text-muted-foreground" data-testid="text-nav-subtitle">GST-ready exports</div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 rounded-full border bg-card/70 p-1 shadow-xs">
            {nav.map((n) => {
              const active = location === n.href;
              return (
                <Link key={n.href} href={n.href}>
                  <a
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm font-medium transition",
                      active
                        ? "bg-[hsl(var(--primary))] text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    data-testid={n.testId}
                  >
                    {n.label}
                  </a>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1.5 text-xs text-muted-foreground shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Prototype • No backend
          </div>
          <Link href="/logout">
            <Button variant="secondary" size="sm" data-testid="button-logout">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-3 flex max-w-7xl gap-1 overflow-x-auto lg:hidden">
        {nav.map((n) => {
          const active = location === n.href;
          return (
            <Link key={n.href} href={n.href}>
              <a
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition",
                  active
                    ? "border-transparent bg-[hsl(var(--primary))] text-primary-foreground"
                    : "bg-card/70 text-muted-foreground hover:text-foreground",
                )}
                data-testid={n.testId}
              >
                {n.label}
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
