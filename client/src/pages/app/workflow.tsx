import TopNav from "@/components/app/top-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  ArrowRight,
  FileSpreadsheet,
  KeyRound,
  Lock,
  ScanText,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

function Step({
  n,
  title,
  desc,
  icon: Icon,
  cta,
  href,
  testId,
}: {
  n: string;
  title: string;
  desc: string;
  icon: any;
  cta?: string;
  href?: string;
  testId: string;
}) {
  return (
    <Card className="border-card-border/70 bg-card/70 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground" data-testid={`${testId}-n`}>Step {n}</div>
            <div className="mt-1 text-sm font-semibold" data-testid={`${testId}-title`}>{title}</div>
            <div className="mt-1 text-sm text-muted-foreground" data-testid={`${testId}-desc`}>{desc}</div>
          </div>
        </div>
        {cta && href ? (
          <Link href={href}>
            <Button size="sm" data-testid={`${testId}-cta`}>
              {cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : null}
      </div>
    </Card>
  );
}

export default function WorkflowPage() {
  return (
    <div>
      <TopNav />

      <div className="grid gap-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-workflow-title">
              Sample workflow
            </h1>
            <p className="mt-1 text-sm text-muted-foreground" data-testid="text-workflow-subtitle">
              A guided demo path for ideathons and client walkthroughs.
            </p>
          </div>
          <Badge className="rounded-full" data-testid="badge-workflow">
            6 steps
          </Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Step
            n="1"
            title="Register with Email + OTP verification"
            desc="Create your business account; OTP is simulated visually."
            icon={ShieldCheck}
            cta="Register"
            href="/register"
            testId="step-register"
          />
          <Step
            n="2"
            title="Login to dashboard"
            desc="Sign in using username/email and password."
            icon={Lock}
            cta="Login"
            href="/login"
            testId="step-login"
          />
          <Step
            n="3"
            title="Upload invoices in Smart Dump"
            desc="Drag-and-drop up to 50 invoice files (PDF/JPG/PNG)."
            icon={UploadCloud}
            cta="Open Smart Dump"
            href="/app/smart-dump"
            testId="step-smartdump"
          />
          <Step
            n="4"
            title="OCR extracts invoice fields"
            desc="Conceptual OCR extraction: invoice no/date, party, GSTIN, HSN, taxes."
            icon={ScanText}
            cta="View Extraction"
            href="/app/extraction"
            testId="step-ocr"
          />
          <Step
            n="5"
            title="Verify extracted data"
            desc="Only verify/adjust; missing fields marked “Needs Review”."
            icon={KeyRound}
            cta="Review"
            href="/app/extraction"
            testId="step-verify"
          />
          <Step
            n="6"
            title="Download GST-ready Excel"
            desc="Export GSTR-1, GSTR-3B summary, and Purchase/ITC (conceptual)."
            icon={FileSpreadsheet}
            cta="Open Reports"
            href="/app/reports"
            testId="step-reports"
          />
        </div>

        <Card className="border-card-border/70 bg-card/70 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="text-sm font-semibold" data-testid="text-workflow-notes-title">Demo notes</div>
          <Separator className="my-4" />
          <ul className="grid gap-2 text-sm text-muted-foreground">
            <li data-testid="text-demo-note-1">• OTP, OCR, and exports are simulated UI/UX only.</li>
            <li data-testid="text-demo-note-2">• Template upload randomizes headings to demonstrate dynamic mapping.</li>
            <li data-testid="text-demo-note-3">• Missing fields show as “Needs Review” to mimic real-world OCR edge cases.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
