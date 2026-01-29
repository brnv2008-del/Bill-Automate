import { useMemo, useRef, useState } from "react";
import TopNav from "@/components/app/top-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ArrowRight, File, FileImage, FileText, Files, UploadCloud } from "lucide-react";

type InvoiceFile = {
  id: string;
  name: string;
  type: string;
  size: number;
};

function prettyBytes(n: number) {
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function iconFor(type: string) {
  if (type.includes("pdf")) return FileText;
  if (type.includes("png") || type.includes("jpg") || type.includes("jpeg")) return FileImage;
  return File;
}

export default function SmartDumpPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [files, setFiles] = useState<InvoiceFile[]>([]);

  const canProceed = useMemo(() => files.length > 0, [files.length]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const next = [...files];

    for (const f of incoming) {
      if (next.length >= 50) break;
      const ok =
        f.type.includes("pdf") ||
        f.type.includes("png") ||
        f.type.includes("jpg") ||
        f.type.includes("jpeg");
      if (!ok) continue;
      next.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: f.name,
        type: f.type || "file",
        size: f.size,
      });
    }

    setFiles(next);
    toast({
      title: "Files added",
      description: `Ready to extract from ${next.length} invoice${next.length === 1 ? "" : "s"}.`,
    });
  }

  return (
    <div>
      <TopNav />

      <div className="grid gap-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-smartdump-title">
              Smart Dump
            </h1>
            <p className="mt-1 text-sm text-muted-foreground" data-testid="text-smartdump-subtitle">
              Bulk invoice upload (up to 50). Accepts PDF, JPG, PNG.
            </p>
          </div>
          <Badge className="rounded-full" data-testid="badge-smartdump-label">
            Smart Dump – Bulk Invoice Upload
          </Badge>
        </div>

        <Card className="border-card-border/70 bg-card/70 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div
            className={
              "relative rounded-2xl border border-dashed p-8 transition " +
              (isOver
                ? "bg-accent/70 border-[hsl(var(--primary))]"
                : "bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--secondary))_140%)]")
            }
            onDragEnter={(e) => {
              e.preventDefault();
              setIsOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsOver(true);
            }}
            onDragLeave={() => setIsOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsOver(false);
              addFiles(e.dataTransfer.files);
            }}
            data-testid="dropzone-invoices"
          >
            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-foreground shadow-xs">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="mt-4 text-lg font-semibold" data-testid="text-dropzone-title">
                Drag and drop invoices
              </div>
              <div className="mt-1 text-sm text-muted-foreground" data-testid="text-dropzone-desc">
                Drop up to 50 invoice files here. We’ll simulate OCR extraction next.
              </div>

              <input
                ref={inputRef}
                type="file"
                multiple
                accept="application/pdf,image/png,image/jpeg"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
                data-testid="input-invoice-files"
              />

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => inputRef.current?.click()}
                  data-testid="button-browse-files"
                >
                  <Files className="mr-2 h-4 w-4" />
                  Browse files
                </Button>
                <Button
                  onClick={() => {
                    if (!files.length) {
                      toast({ title: "No files", description: "Add at least one invoice to continue." });
                      return;
                    }
                    toast({ title: "Queued for OCR", description: "Next: simulate extraction." });
                  }}
                  disabled={!files.length}
                  data-testid="button-queue-ocr"
                >
                  Queue extraction
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border bg-card px-3 py-1" data-testid="pill-types">PDF • JPG • PNG</span>
                <span className="rounded-full border bg-card px-3 py-1" data-testid="pill-limit">Up to 50 files</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold" data-testid="text-uploaded-title">Uploaded invoices</div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFiles([]);
                toast({ title: "Cleared", description: "Removed all uploaded files." });
              }}
              disabled={!files.length}
              data-testid="button-clear-files"
            >
              Clear
            </Button>
          </div>

          <div className="mt-4 grid gap-2">
            {files.length === 0 ? (
              <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground" data-testid="empty-files">
                No invoices uploaded yet.
              </div>
            ) : (
              files.map((f, idx) => {
                const Icon = iconFor(f.type);
                return (
                  <div
                    key={f.id}
                    className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3"
                    data-testid={`row-invoice-${idx}`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium" data-testid={`text-invoice-name-${idx}`}>{f.name}</div>
                        <div className="text-xs text-muted-foreground" data-testid={`text-invoice-meta-${idx}`}>{prettyBytes(f.size)}</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="rounded-full" data-testid={`badge-invoice-type-${idx}`}>
                      {f.type.includes("pdf") ? "PDF" : "Image"}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground" data-testid="text-proceed-hint">
              Next: OCR extraction + Excel template mapping (simulated).
            </div>
            <Link href="/app/extraction">
              <Button disabled={!canProceed} data-testid="button-go-extraction">
                Go to extraction
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
