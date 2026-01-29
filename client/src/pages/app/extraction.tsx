import { useMemo, useRef, useState } from "react";
import TopNav from "@/components/app/top-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ArrowRight, BadgeCheck, CircleAlert, FileSpreadsheet, RefreshCw, Sparkles } from "lucide-react";

type OCRField =
  | "Invoice Number"
  | "Invoice Date"
  | "Party Name"
  | "GSTIN"
  | "HSN Code"
  | "Taxable Value"
  | "CGST"
  | "SGST"
  | "IGST";

type TemplateHeading = string;

type Row = {
  id: string;
  mapped: Record<string, string>;
  status: "Verified" | "Pending Review";
};

const ocrSample: Record<OCRField, string> = {
  "Invoice Number": "INV-2026-0142",
  "Invoice Date": "2026-01-12",
  "Party Name": "Shree Traders",
  GSTIN: "27AAECS1234F1ZV",
  "HSN Code": "8471",
  "Taxable Value": "125000",
  CGST: "11250",
  SGST: "11250",
  IGST: "0",
};

function makeRows(headings: TemplateHeading[], count: number): Row[] {
  const base = [
    { ...ocrSample, "Invoice Number": "INV-2026-0142", "Taxable Value": "125000" },
    { ...ocrSample, "Invoice Number": "INV-2026-0143", GSTIN: "29BBNPS9988Q1Z2", "Taxable Value": "48250", CGST: "4342", SGST: "4342" },
    { ...ocrSample, "Invoice Number": "INV-2026-0144", "Party Name": "Aarav & Co.", "HSN Code": "9983", "Taxable Value": "76000", IGST: "0", CGST: "6840", SGST: "6840" },
  ];

  const rows: Row[] = [];
  for (let i = 0; i < count; i++) {
    const src = base[i % base.length];
    const mapped: Record<string, string> = {};

    for (const h of headings) {
      const key = h.toLowerCase();
      let value = "";

      if (key.includes("gst") && key.includes("no")) value = src.GSTIN;
      else if (key.includes("gstin")) value = src.GSTIN;
      else if (key.includes("invoice") && key.includes("no")) value = src["Invoice Number"];
      else if (key === "date" || key.includes("invoice date")) value = src["Invoice Date"];
      else if (key.includes("hsn")) value = src["HSN Code"];
      else if (key.includes("party") || key.includes("customer") || key.includes("name")) value = src["Party Name"];
      else if (key.includes("taxable")) value = src["Taxable Value"];
      else if (key.includes("cgst")) value = src.CGST;
      else if (key.includes("sgst")) value = src.SGST;
      else if (key.includes("igst")) value = src.IGST;
      else value = "";

      mapped[h] = value;
    }

    const hasMissing = headings.some((h) => !mapped[h]);
    rows.push({
      id: `${i + 1}`,
      mapped,
      status: hasMissing ? "Pending Review" : "Verified",
    });
  }

  return rows;
}

export default function ExtractionPage() {
  const [templateHeadings, setTemplateHeadings] = useState<TemplateHeading[]>([
    "GST No",
    "HSN",
    "Invoice No",
    "Date",
    "Taxable Value",
    "CGST",
    "SGST",
    "IGST",
  ]);

  const [rows, setRows] = useState<Row[]>(() => makeRows(templateHeadings, 6));
  const [activeRow, setActiveRow] = useState(0);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [templateName, setTemplateName] = useState("GST_Template.xlsx");

  const headingsText = useMemo(() => templateHeadings.join(", "), [templateHeadings]);
  const counts = useMemo(() => {
    const verified = rows.filter((r) => r.status === "Verified").length;
    const pending = rows.filter((r) => r.status === "Pending Review").length;
    return { verified, pending, total: rows.length };
  }, [rows]);

  function loadTemplate(fileName: string) {
    setTemplateName(fileName);

    const demoVariants: TemplateHeading[][] = [
      ["GST No", "HSN", "Invoice No", "Date", "Taxable Value", "CGST", "SGST", "IGST"],
      ["GSTIN", "Invoice Number", "Invoice Date", "Party Name", "HSN Code", "Taxable Value", "IGST"],
      ["Customer", "GST No", "Invoice No", "Date", "Taxable Value", "CGST", "SGST"],
    ];

    const nextHeadings = demoVariants[Math.floor(Math.random() * demoVariants.length)];
    setTemplateHeadings(nextHeadings);
    const nextRows = makeRows(nextHeadings, 8);

    if (nextRows[1]) nextRows[1].mapped[nextHeadings[0]] = "";
    if (nextRows[3]) nextRows[3].mapped[nextHeadings[nextHeadings.length - 1]] = "";
    nextRows.forEach((r) => {
      const missing = nextHeadings.some((h) => !r.mapped[h]);
      r.status = missing ? "Pending Review" : "Verified";
    });

    setRows(nextRows);
    setActiveRow(0);

    toast({
      title: "Template loaded",
      description: `Detected headings: ${nextHeadings.join(", ")}`,
    });
  }

  const current = rows[activeRow];

  return (
    <div>
      <TopNav />

      <div className="grid gap-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-extraction-title">
              OCR extraction + template mapping
            </h1>
            <p className="mt-1 text-sm text-muted-foreground" data-testid="text-extraction-subtitle">
              Conceptual flow: OCR fields mapped to your uploaded Excel headings.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full" data-testid="badge-template-name">
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
              {templateName}
            </Badge>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                loadTemplate(f.name);
              }}
              data-testid="input-template-file"
            />
            <Button
              variant="secondary"
              onClick={() => fileRef.current?.click()}
              data-testid="button-upload-template"
            >
              Upload template
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-card-border/70 bg-card/70 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60 lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold" data-testid="text-preview-title">Extracted invoice preview</div>
                <div className="mt-1 text-sm text-muted-foreground" data-testid="text-preview-subtitle">
                  Mapped to headings: <span className="font-medium text-foreground">{headingsText}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full" data-testid="badge-count-total">{counts.total} rows</Badge>
                <Badge className="rounded-full" data-testid="badge-count-verified">
                  <BadgeCheck className="mr-1.5 h-3.5 w-3.5" />
                  {counts.verified} verified
                </Badge>
                <Badge variant="secondary" className="rounded-full" data-testid="badge-count-pending">
                  <CircleAlert className="mr-1.5 h-3.5 w-3.5" />
                  {counts.pending} pending
                </Badge>
              </div>
            </div>

            <Separator className="my-5" />

            <div className="rounded-xl border bg-card">
              <div className="max-w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {templateHeadings.map((h) => (
                        <TableHead key={h} className="whitespace-nowrap">
                          {h}
                        </TableHead>
                      ))}
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r, idx) => (
                      <TableRow key={r.id} data-testid={`row-extracted-${idx}`}>
                        {templateHeadings.map((h) => {
                          const v = r.mapped[h];
                          const missing = !v;
                          return (
                            <TableCell key={h} className="whitespace-nowrap">
                              {missing ? (
                                <span className="inline-flex items-center gap-2 rounded-full border bg-secondary px-2.5 py-1 text-xs text-muted-foreground" data-testid={`status-needs-review-${idx}-${h}`}>
                                  Needs Review
                                </span>
                              ) : (
                                <span data-testid={`text-cell-${idx}-${h}`}>{v}</span>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell>
                          <span
                            className={
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium " +
                              (r.status === "Verified"
                                ? "bg-[hsl(var(--primary))] text-primary-foreground"
                                : "bg-secondary text-foreground")
                            }
                            data-testid={`status-row-${idx}`}
                          >
                            {r.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setActiveRow(idx)}
                            data-testid={`button-review-row-${idx}`}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground" data-testid="text-next-report-hint">
                Next: Export GST-ready Excel (conceptual).
              </div>
              <Link href="/app/reports">
                <Button data-testid="button-go-reports">
                  Go to reports
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="border-card-border/70 bg-card/70 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold" data-testid="text-verify-title">Verification</div>
                <div className="mt-1 text-sm text-muted-foreground" data-testid="text-verify-subtitle">
                  No typing—only confirm/adjust mapping.
                </div>
              </div>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => loadTemplate(templateName)}
                data-testid="button-rerun-extraction"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <Separator className="my-5" />

            <div className="rounded-xl border bg-card p-4">
              <div className="text-xs font-medium text-muted-foreground" data-testid="text-current-row">
                Selected row
              </div>
              <div className="mt-1 text-sm font-semibold" data-testid="text-selected-invoice">
                Invoice #{current?.mapped[templateHeadings.find((h) => h.toLowerCase().includes("invoice")) || templateHeadings[0]] || current?.id}
              </div>
              <div className="mt-2">
                <span
                  className={
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium " +
                    (current?.status === "Verified"
                      ? "bg-[hsl(var(--primary))] text-primary-foreground"
                      : "bg-secondary text-foreground")
                  }
                  data-testid="status-selected"
                >
                  {current?.status}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="grid gap-2">
                <Label>Change status</Label>
                <Select
                  value={current?.status || "Pending Review"}
                  onValueChange={(v) => {
                    const next = [...rows];
                    next[activeRow] = { ...next[activeRow], status: v as any };
                    setRows(next);
                  }}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Verified" data-testid="option-verified">Verified</SelectItem>
                    <SelectItem value="Pending Review" data-testid="option-pending">Pending Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Mark a missing field as filled (demo)</Label>
                <Input
                  placeholder="Type any value to simulate a fix"
                  onChange={(e) => {
                    const value = e.target.value;
                    const next = [...rows];
                    const r = { ...next[activeRow], mapped: { ...next[activeRow].mapped } };
                    const missingKey = templateHeadings.find((h) => !r.mapped[h]);
                    if (!missingKey) return;
                    r.mapped[missingKey] = value;
                    r.status = templateHeadings.some((h) => !r.mapped[h]) ? "Pending Review" : "Verified";
                    next[activeRow] = r;
                    setRows(next);
                  }}
                  data-testid="input-fill-missing"
                />
                <div className="text-xs text-muted-foreground" data-testid="text-fill-hint">
                  This simulates “Needs Review” becoming verified.
                </div>
              </div>

              <Button
                onClick={() =>
                  toast({
                    title: "Verified",
                    description: "Changes applied locally (prototype).",
                  })
                }
                data-testid="button-save-verification"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Apply verification
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
