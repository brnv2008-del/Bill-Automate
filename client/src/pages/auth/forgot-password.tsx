import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const otpExpected = "123456";

  const emailDisabled = useMemo(() => !email.trim(), [email]);
  const otpDisabled = useMemo(() => otp.length !== 6, [otp]);
  const resetDisabled = useMemo(() => newPassword.length < 6 || newPassword !== confirm, [newPassword, confirm]);

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-lg items-center">
      <Card className="overflow-hidden border-card-border/70 shadow-md">
        <div className="p-6 sm:p-7">
          <button
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setLocation("/login")}
            type="button"
            data-testid="link-back-login"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </button>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight" data-testid="text-forgot-title">
            Reset password
          </h1>
          <p className="mt-1 text-sm text-muted-foreground" data-testid="text-forgot-subtitle">
            OTP is simulated for demo.
          </p>

          <Separator className="my-6" />

          {step === "email" && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Registered Email ID</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. accounts@shreetraders.in"
                  data-testid="input-email"
                />
              </div>
              <Button
                disabled={emailDisabled}
                onClick={() => {
                  toast({ title: "OTP sent", description: `We sent an OTP to ${email || "your email"} (simulated).` });
                  setStep("otp");
                }}
                data-testid="button-send-otp"
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
                    <div className="text-sm font-semibold" data-testid="text-otp-title">Verify OTP</div>
                    <div className="mt-1 text-sm text-muted-foreground" data-testid="text-otp-subtitle">
                      Enter OTP for <span className="font-medium text-foreground">{email}</span>
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
                  disabled={otpDisabled}
                  onClick={() => {
                    if (otp !== otpExpected) {
                      toast({ title: "Incorrect OTP", description: "For demo use 123456." });
                      return;
                    }
                    toast({ title: "OTP verified", description: "Set a new password." });
                    setStep("reset");
                  }}
                  data-testid="button-verify-otp"
                >
                  Verify OTP
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => toast({ title: "OTP re-sent", description: "OTP sent again (simulated)." })}
                  data-testid="button-resend-otp"
                >
                  Resend OTP
                </Button>
              </div>
            </div>
          )}

          {step === "reset" && (
            <div className="grid gap-4">
              <div className="rounded-xl border bg-card/70 p-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold" data-testid="text-reset-title">Create new password</div>
                    <div className="mt-1 text-sm text-muted-foreground" data-testid="text-reset-subtitle">
                      Password reset is simulated for demo.
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  data-testid="input-new-password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  data-testid="input-confirm-password"
                />
              </div>

              <Button
                disabled={resetDisabled}
                onClick={() => {
                  toast({ title: "Password updated", description: "You can now sign in (simulated)." });
                  setLocation("/login");
                }}
                data-testid="button-reset-password"
              >
                Update password
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
