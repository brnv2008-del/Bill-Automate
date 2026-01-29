import TopNav from "@/components/app/top-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  ArrowRight,
  CalendarRange,
  CircleCheck,
  Clock,
  FileUp,
  IndianRupee,
  ReceiptText,
} from "lucide-react";

function SummaryCard({
  title,
  value,
  helper,
  icon: Icon,
  testId,
}: {
  title: string;
  value: string;
  helper: string;
  icon: any;
  testId: string;
}) {
  return (
    <Card className="ag-noise border-card-border/70 bg-card/70 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-muted-foreground" data-testid={`${testId}-title`}>{title}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight" data-testid={`${testId}-value`}>{value}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-foreground">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
      <div className="mt-4 text-xs text-muted-foreground" data-testid={`${testId}-helper`}>{helper}</div>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <TopNav />

      <div className="grid gap-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-dashboard-title">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground" data-testid="text-dashboard-subtitle">
              Overview for the current month (simulated).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full" data-testid="badge-month">
              <CalendarRange className="mr-1.5 h-3.5 w-3.5" />
              Jan 2026
            </Badge>
            <Link href="/app/smart-dump">
              <Button data-testid="button-go-smart-dump">
                <FileUp className="mr-2 h-4 w-4" />
                Smart Dump
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total Invoices"
            value="128"
            helper="Imported this month (mock)"
            icon={ReceiptText}
            testId="card-total-invoices"
          />
          <SummaryCard
            title="GST Payable"
            value="₹ 84,260"
            helper="Auto-calculated (mock)"
            icon={IndianRupee}
            testId="card-gst-payable"
          />
          <SummaryCard
            title="Paid Invoices"
            value="92"
            helper="Settled (mock)"
            icon={CircleCheck}
            testId="card-paid-invoices"
          />
          <SummaryCard
            title="Pending Invoices"
            value="36"
            helper="Needs follow-up (mock)"
            icon={Clock}
            testId="card-pending-invoices"
          />
        </div>

        <Card className="border-card-border/70 bg-card/70 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold" data-testid="text-next-steps-title">Sample workflow</div>
              <div className="mt-1 text-sm text-muted-foreground" data-testid="text-next-steps-subtitle">
                One realistic path through the product.
              </div>
            </div>
            <Link href="/app/workflow">
              <Button variant="secondary" data-testid="button-view-workflow">
                View steps
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <Separator className="my-5" />

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-4">
              <div className="text-xs font-medium text-muted-foreground" data-testid="text-step-1">Step 1</div>
              <div className="mt-1 text-sm font-semibold">Bulk upload invoices</div>
              <div className="mt-1 text-sm text-muted-foreground">Drag & drop up to 50 files (PDF/JPG/PNG).</div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="text-xs font-medium text-muted-foreground" data-testid="text-step-2">Step 2</div>
              <div className="mt-1 text-sm font-semibold">Simulate OCR extraction</div>
              <div className="mt-1 text-sm text-muted-foreground">Auto-fill invoice fields (no typing).</div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="text-xs font-medium text-muted-foreground" data-testid="text-step-3">Step 3</div>
              <div className="mt-1 text-sm font-semibold">Map to Excel template</div>
              <div className="mt-1 text-sm text-muted-foreground">Missing fields marked “Needs Review”.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
