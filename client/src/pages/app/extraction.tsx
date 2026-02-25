
import { useState, useEffect } from "react";
import TopNav from "@/components/app/top-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ArrowRight, Sparkles, Loader2, CircleAlert, BadgeCheck } from "lucide-react";

type UploadedFile = {
  id: string;
  name: string;
  status: string;
  uploadedAt: string;
  extractedData?: Record<string, string>;
};

const TABLE_HEADINGS = ["GST No", "Invoice No", "Date", "Party Name", "Taxable Value", "Total Amount"];

export default function ExtractionPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchFiles() {
    if (!isFetching) setIsFetching(true);
    try {
      const res = await fetch("/api/uploads");
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  async function handleGeminiExtract(file: UploadedFile) {
    setProcessingId(file.id);
    try {
      const res = await fetch(`/api/uploads/${file.id}/extract`, { method: "POST" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Extraction failed");
      }
      toast({ title: `Gemini extracted data for ${file.name}!` });
      await fetchFiles(); // Refresh the list
    } catch (err) {
      toast({ title: "Extraction Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div>
      <TopNav />
      <div className="grid gap-6">
        <h1 className="text-2xl font-semibold">Gemini-Powered Extraction</h1>
        <p className="text-sm text-muted-foreground -mt-4">AI will read each uploaded invoice and extract key data points.</p>
        
        <Card className="border-card-border/70 bg-card/70 p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Uploaded Invoice Queue</h2>
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Status</TableHead>
                  {TABLE_HEADINGS.map(h => <TableHead key={h}>{h}</TableHead>)}
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetching ? (
                  <TableRow><TableCell colSpan={TABLE_HEADINGS.length + 3} className="h-24 text-center">Loading invoice queue...</TableCell></TableRow>
                ) : files.length === 0 ? (
                  <TableRow><TableCell colSpan={TABLE_HEADINGS.length + 3} className="h-24 text-center">No invoices uploaded. <Link href="/app/smart-dump" className="text-primary hover:underline">Upload now</Link>.</TableCell></TableRow>
                ) : (
                  files.map(file => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium truncate max-w-xs">{file.name}</TableCell>
                      <TableCell>
                        <Badge variant={file.status === 'Extracted' ? 'default' : 'secondary'} className="items-center">
                          {file.status === 'Extracted' && <BadgeCheck className="mr-1.5 h-3 w-3" />}
                          {file.status === 'Extraction Failed' && <CircleAlert className="mr-1.5 h-3 w-3" />}
                          {file.status}
                        </Badge>
                      </TableCell>
                      {TABLE_HEADINGS.map(h => (
                        <TableCell key={h}>{file.extractedData ? file.extractedData[h] : <i className="text-muted-foreground text-xs">N/A</i>}</TableCell>
                      ))}
                      <TableCell className="text-right">
                        {file.status === 'Uploaded' && (
                          <Button size="sm" onClick={() => handleGeminiExtract(file)} disabled={processingId !== null}>
                            {processingId === file.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                            {processingId === file.id ? 'Running...' : 'Run Gemini'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex justify-end">
            <Link href="/app/reports">
              <Button>
                Go to Reports
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
