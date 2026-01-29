import TopNav from "@/components/app/top-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Download, FileSpreadsheet, LineChart, PackageOpen, ReceiptText } from "lucide-react";

function ReportCard({
  title,
  desc,
  icon: Icon,
  testId,
}: {
  title: string;
  desc: string;
  icon: any;
  testId: string;
}) {
  return (
    <Card className="border-card-border/70 bg-card/70 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold" data-testid={`${testId}-title`}>{title}</div>
          <div className="mt-1 text-sm text-muted-foreground" data-testid={`${testId}-desc`}>{desc}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <Separator className="my-5" />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => toast({ title: "Download started", description: "Excel export is conceptual in this prototype." })}
          data-testid={`button-download-${testId}`}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Excel
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast({ title: "Preview", description: "In a real app this opens the generated Excel." })}
          data-testid={`button-preview-${testId}`}
        >
          Preview
        </Button>
      </div>

      <div className="mt-4 text-xs text-muted-foreground" data-testid={`${testId}-hint`}>
        Compatible with Tally workflows (conceptual).
      </div>
    </Card>
  );
}

export default function ReportsPage() {
  return (
    <div>
      <TopNav />

      <div className="grid gap-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-reports-title">GST reports</h1>
            <p className="mt-1 text-sm text-muted-foreground" data-testid="text-reports-subtitle">
              Monthly exports in GST-ready Excel formats (simulated).
            </p>
          </div>
          <Badge variant="secondary" className="rounded-full" data-testid="badge-report-month">
            <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
            Jan 2026
          </Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <ReportCard
            title="GSTR-1 (Sales)"
            desc="Outward supplies summary from verified invoices."
            icon={ReceiptText}
            testId="gstr1"
          />
          <ReportCard
            title="GSTR-3B Summary"
            desc="Tax liability + payment summary for the month."
            icon={LineChart}
            testId="gstr3b"
          />
          <ReportCard
            title="Purchase & ITC"
            desc="Input credits and vendor invoice tracking."
            icon={PackageOpen}
            testId="itc"
          />
        </div>

        <Card className="border-card-border/70 bg-card/70 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold" data-testid="text-export-note-title">Export notes</div>
              <div className="mt-1 text-sm text-muted-foreground" data-testid="text-export-note-desc">
                In the full product, exports follow your uploaded Excel template headings.
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => toast({ title: "Template mapping", description: "Go to Extraction to upload a template and review headings." })}
              data-testid="button-open-mapping"
            >
              View mapping
            </Button>
          </div>

          <Separator className="my-5" />

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-4">
              <div className="text-xs font-medium text-muted-foreground" data-testid="text-export-point-1">Rule</div>
              <div className="mt-1 text-sm font-semibold">No manual entry</div>
              <div className="mt-1 text-sm text-muted-foreground">Only verify exceptions flagged by OCR/mapping.</div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="text-xs font-medium text-muted-foreground" data-testid="text-export-point-2">Rule</div>
              <div className="mt-1 text-sm font-semibold">Template-first</div>
              <div className="mt-1 text-sm text-muted-foreground">System reads headings before mapping fields.</div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="text-xs font-medium text-muted-foreground" data-testid="text-export-point-3">Rule</div>
              <div className="mt-1 text-sm font-semibold">Tally-compatible</div>
              <div className="mt-1 text-sm text-muted-foreground">Excel structure designed for accounting import.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
