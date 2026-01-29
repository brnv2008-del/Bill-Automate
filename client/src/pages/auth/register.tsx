import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";

type Step = "form" | "otp" | "done";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("form");

  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otp, setOtp] = useState("");
  const otpExpected = "123456";

  const formDisabled = useMemo(() => {
    if (!businessName.trim()) return true;
    if (!email.trim()) return true;
    if (!username.trim()) return true;
    if (password.length < 6) return true;
    if (password !== confirmPassword) return true;
    return false;
  }, [businessName, email, username, password, confirmPassword]);

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-lg items-center">
      <Card className="overflow-hidden border-card-border/70 shadow-md">
        <div className="p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <button
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setLocation("/login")}
              type="button"
              data-testid="link-back-login"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="text-xs text-muted-foreground">Step {step === "form" ? "1" : step === "otp" ? "2" : "3"} of 3</div>
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight" data-testid="text-register-title">Create your business account</h1>
          <p className="mt-1 text-sm text-muted-foreground" data-testid="text-register-subtitle">
            OTP verification is simulated for demo.
          </p>

          <Separator className="my-6" />

          {step === "form" && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="businessName">Business name</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Shree Traders"
                  data-testid="input-business-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email ID</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. accounts@shreetraders.in"
                  data-testid="input-email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. shree.accounts"
                  data-testid="input-username"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  data-testid="input-register-password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  data-testid="input-confirm-password"
                />
              </div>

              <Button
                disabled={formDisabled}
                onClick={() => {
                  toast({ title: "OTP sent", description: `We sent an OTP to ${email || "your email"} (simulated).` });
                  setStep("otp");
                }}
                data-testid="button-register"
              >
                Send OTP
              </Button>

              <div className="text-xs text-muted-foreground">
                Demo tip: use OTP <span className="font-mono">123456</span>.
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="grid gap-4">
              <div className="rounded-xl border bg-card/70 p-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold" data-testid="text-otp-title">Verify email</div>
                    <div className="mt-1 text-sm text-muted-foreground" data-testid="text-otp-subtitle">
                      Enter the 6-digit OTP sent to <span className="font-medium text-foreground">{email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>OTP</Label>
                <InputOTP maxLength={6} value={otp} onChange={setOtp} data-testid="input-otp">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="grid gap-3">
                <Button
                  onClick={() => {
                    if (otp !== otpExpected) {
                      toast({ title: "Incorrect OTP", description: "For demo use 123456." });
                      return;
                    }
                    toast({ title: "Email verified successfully. Account created." });
                    setStep("done");
                  }}
                  data-testid="button-verify-otp"
                >
                  Verify OTP
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    toast({ title: "OTP re-sent", description: "OTP sent again (simulated)." });
                  }}
                  data-testid="button-resend-otp"
                >
                  Resend OTP
                </Button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="grid gap-4">
              <div className="rounded-xl border bg-card/70 p-5 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-primary-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold" data-testid="text-account-created">
                      Email verified successfully. Account created.
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      You can now sign in to the dashboard.
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setLocation("/login")}
                data-testid="button-go-login"
              >
                Go to login
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
