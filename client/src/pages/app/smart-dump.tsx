
import { useMemo, useRef, useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";
import TopNav from "@/components/app/top-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ArrowRight, File, FileImage, FileText, Files, UploadCloud, Loader2 } from "lucide-react";

type InvoiceFile = {
  id: string;
  name: string;
  status: string;
  storagePath: string;
  uploadedAt: string;
};

function iconFor(name: string) {
  if (name.endsWith('.pdf')) return FileText;
  if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) return FileImage;
  return File;
}

export default function SmartDumpPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [files, setFiles] = useState<InvoiceFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await fetch("/api/uploads");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setFiles(data);
      } catch (err) {
        toast({ title: "Error fetching files", variant: "destructive" });
      } finally {
        setIsFetching(false);
      }
    }
    fetchFiles();
  }, []);

  const canProceed = useMemo(() => files.length > 0 && files.every(f => f.status === 'Uploaded'), [files]);

  async function handleFileUpload(list: FileList | null) {
    if (!list || list.length === 0) return;
    setIsUploading(true);

    const uploads = Array.from(list).filter(f => /(\.pdf|\.png|\.jpe?g)$/i.test(f.name));
    if (uploads.length === 0) {
      toast({ title: "No valid files selected", description: "Only PDF, JPG, and PNG are allowed." , variant: "destructive"});
      setIsUploading(false);
      return;
    }

    let successCount = 0;
    for (const file of uploads) {
      const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);
      try {
        const snapshot = await uploadBytes(storageRef, file);
        const storagePath = snapshot.metadata.fullPath;

        const res = await fetch("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, storagePath }),
        });

        if (!res.ok) throw new Error("Failed to record upload");
        const newFile = await res.json();
        setFiles(prev => [newFile, ...prev]);
        successCount++;
      } catch (err) {
        console.error(err);
        toast({ title: `Failed to upload ${file.name}`, variant: "destructive" });
      }
    }
    
    if (successCount > 0) {
      toast({ title: `Uploaded ${successCount} file(s) successfully` });
    }
    setIsUploading(false);
  }

  return (
    <div>
      <TopNav />
      <div className="grid gap-6">
        <h1 className="text-2xl font-semibold">Smart Dump - Bulk Invoice Upload</h1>

        <Card className="border-card-border/70 bg-card/70 p-6 shadow-sm">
          <div
            className={`relative rounded-2xl border-dashed p-8 transition border-2 ${isOver ? 'border-primary bg-accent/70' : ''}`}
            onDragEnter={e => { e.preventDefault(); setIsOver(true); }}
            onDragOver={e => { e.preventDefault(); setIsOver(true); }}
            onDragLeave={() => setIsOver(false)}
            onDrop={e => { e.preventDefault(); setIsOver(false); handleFileUpload(e.dataTransfer.files); }}
          >
            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
              <UploadCloud className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-semibold">Drag and drop invoices here</p>
              <p className="mt-1 text-sm text-muted-foreground">PDF, JPG, or PNG. Up to 50 files.</p>
              <input ref={inputRef} type="file" multiple onChange={e => handleFileUpload(e.target.files)} className="hidden" />
              <Button variant="secondary" className="mt-5" onClick={() => inputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Files className="mr-2 h-4 w-4"/>}
                {isUploading ? 'Uploading...' : 'Browse files'}
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          <h2 className="font-semibold mb-4">Uploaded Invoices (from Firebase)</h2>
          <div className="grid gap-2">
            {isFetching ? (
              <div className="text-center text-muted-foreground p-5">Loading files...</div>
            ) : files.length === 0 ? (
              <div className="text-center text-muted-foreground p-5">No invoices uploaded yet.</div>
            ) : (
              files.map((f) => {
                const Icon = iconFor(f.name);
                return (
                  <div key={f.id} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-muted-foreground"/>
                      <div>
                        <p className="font-medium truncate">{f.name}</p>
                        <p className="text-xs text-muted-foreground">Uploaded: {new Date(f.uploadedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <Badge variant={f.status === 'Uploaded' ? 'secondary' : 'outline'}>{f.status}</Badge>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Link href="/app/extraction">
              <Button disabled={!canProceed || isUploading}>
                Go to Extraction
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
