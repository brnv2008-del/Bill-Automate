import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, FileSpreadsheet, Lock, ShieldCheck } from "lucide-react";

function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,hsl(200_94%_44%)_45%,hsl(216_92%_52%/0.1)_100%)] shadow-sm ag-noise" />
      <div>
        <div className="text-lg font-semibold leading-tight" data-testid="text-appname">
          AutoGST Billing
        </div>
        <div className="text-xs text-muted-foreground" data-testid="text-appsubtitle">
          OCR + Excel mapping for GST-ready exports
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc, testId }: any) {
  return (
    <div className="flex gap-3 rounded-xl border bg-card/70 p-4 shadow-xs backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-foreground">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold" data-testid={testId}>{title}</div>
        <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const disabled = useMemo(() => !identifier.trim() || password.length < 4, [identifier, password]);

  return (
    <div className="grid min-h-[calc(100dvh-3rem)] items-center gap-6 lg:grid-cols-2">
      <div className="hidden lg:block">
        <LogoMark />
        <h1 className="mt-10 text-4xl font-semibold tracking-tight">
          Faster billing.
          <span className="block text-muted-foreground">Cleaner GST compliance.</span>
        </h1>
        <p className="mt-4 max-w-prose text-sm text-muted-foreground">
          Upload invoices in bulk, simulate OCR extraction, map to your Excel template headings, verify exceptions,
          then export GST-ready reports compatible with Tally workflows.
        </p>

        <div className="mt-8 grid gap-3">
          <Feature
            icon={ShieldCheck}
            title="OTP verification (simulated)"
            desc="Realistic flows for register + password reset without backend dependencies."
            testId="text-feature-otp"
          />
          <Feature
            icon={FileSpreadsheet}
            title="Template-based mapping"
            desc="Reads your Excel headings and auto-maps extracted invoice fields."
            testId="text-feature-mapping"
          />
          <Feature
            icon={Lock}
            title="Audit-friendly review"
            desc="Highlights missing/unclear fields as “Needs Review” for quick verification."
            testId="text-feature-review"
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <Card className="overflow-hidden border-card-border/70 shadow-md">
          <div className="p-6 sm:p-7">
            <div className="lg:hidden">
              <LogoMark />
              <Separator className="my-5" />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight" data-testid="text-login-title">Sign in</h2>
                <p className="mt-1 text-sm text-muted-foreground" data-testid="text-login-subtitle">
                  Use your username or email.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
                Prototype mode
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="identifier">Username or Email</Label>
                <Input
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. mahesh@business.in"
                  data-testid="input-identifier"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    className="text-xs font-medium text-[hsl(var(--primary))] hover:underline"
                    onClick={() => setLocation("/forgot-password")}
                    data-testid="link-forgot-password"
                    type="button"
                  >
                    Forgot?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  data-testid="input-password"
                />
              </div>

              <Button
                className="mt-1"
                disabled={disabled}
                onClick={() => {
                  try {
                    window.localStorage.setItem("autogst.authed", "1");
                  } catch {
                    // ignore
                  }
                  toast({ title: "Signed in", description: "Welcome to AutoGST Billing (prototype)." });
                  setLocation("/app");
                }}
                data-testid="button-login"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                New here?{" "}
                <button
                  className="font-medium text-[hsl(var(--primary))] hover:underline"
                  onClick={() => setLocation("/register")}
                  data-testid="link-register"
                  type="button"
                >
                  Create an account
                </button>
              </div>
            </div>
          </div>
          <div className="border-t bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--secondary))_120%)] p-5 text-xs text-muted-foreground">
            By continuing you agree to a simulated OTP verification flow for demo purposes.
          </div>
        </Card>
      </div>
    </div>
  );
}
