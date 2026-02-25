
import { useState, useMemo, useEffect, useRef } from "react";
import TopNav from "@/components/app/top-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Save, Sparkles, Loader2 } from "lucide-react";
import { storage } from "@/firebase";
import { ref, uploadBytes } from "firebase/storage";

type SaleEntry = {
  id: string;
  customerName: string;
  gstNumber: string;
  itemDescription: string;
  totalAmount: number;
  date: string;
};

export default function ManualEntryPage() {
  const [customerName, setCustomerName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [itemDescription, setItemDescription] = useState("General Goods");
  const [price, setPrice] = useState(""); // This will hold the total amount
  const [history, setHistory] = useState<SaleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/invoices");
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        toast({ title: "Error fetching history", variant: "destructive" });
      } finally {
        setIsFetching(false);
      }
    }
    fetchHistory();
  }, []);

  const totalAmount = useMemo(() => {
    return parseFloat(price) || 0;
  }, [price]);

  const handleFileSelected = async (file: File | null) => {
    if (!file) return;
    setIsExtracting(true);
    toast({ title: "Uploading bill..." });

    try {
      const transientPath = `uploads/transient/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, transientPath);
      await uploadBytes(storageRef, file);
      toast({ title: "Analyzing with Gemini AI..." });

      const res = await fetch("/api/extract-transient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath: transientPath }),
      });

      if (!res.ok) {
        throw new Error((await res.json()).error || "AI extraction failed");
      }

      const data = await res.json();
      setCustomerName(data.partyName || "");
      setGstNumber(data.gstNumber || "");
      setPrice(data.totalAmount?.toString() || "");
      setItemDescription(`Invoice #${data.invoiceNumber || 'N/A'}`);

      toast({ title: "Success!", description: "Form has been auto-filled by AI." });

    } catch (err) {
      toast({ title: "AI Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsExtracting(false);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  
  const handleSave = async () => {
    if (!customerName || !price) {
      toast({ title: "Customer Name and Total Amount are required.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    const newEntry = {
      customerName,
      gstNumber,
      itemDescription,
      totalAmount,
      gstRate: 0, // Explicitly set GST rate to 0
    };

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      if (!res.ok) throw new Error("Failed to save invoice");
      const savedEntry = await res.json();
      setHistory([savedEntry, ...history]);
      
      setCustomerName("");
      setGstNumber("");
      setPrice("");
      setItemDescription("General Goods");

      toast({ title: "Invoice saved to Firestore!" });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <TopNav />
      <div className="grid gap-6">
        <h1 className="text-2xl font-semibold">Manual Entry</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-card-border/70 bg-card/70 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-semibold text-lg">New Invoice</h2>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" ref={fileInputRef} onChange={e => handleFileSelected(e.target.files ? e.target.files[0] : null)} className="hidden" />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isExtracting}>
                {isExtracting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isExtracting ? 'Analyzing Bill...' : 'Auto-fill with AI'}
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input id="customerName" placeholder="e.g. Acme Inc." value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input id="gstNumber" placeholder="22AAAAA0000A1Z5" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="description">Item Description</Label>
                <Input id="description" placeholder="e.g. Product or Service" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="price">Total Amount (from bill) *</Label>
                <Input id="price" type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
                <p className="text-xs text-muted-foreground">Enter the final amount. GST details are not required for this simplified entry.</p>
              </div>

              <div className="sm:col-span-2 mt-4 rounded-xl bg-primary/5 p-4">
                <div className="flex justify-between font-semibold text-primary">
                  <span>Total Amount to Save</span>
                  <span>{totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
              </div>

              <div className="sm:col-span-2 pt-2">
                <Button className="w-full h-11" onClick={handleSave} disabled={isLoading || isExtracting}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save to Firestore
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border-card-border/70 bg-card/70 p-6 shadow-sm h-fit">
            <h3 className="font-semibold mb-4">Two Ways to Enter</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><strong className="text-foreground">Manual Typing:</strong> Fill out the form fields by hand as you normally would.</li>
              <li className="flex items-start gap-2"><strong className="text-foreground">AI Auto-fill:</strong> Click the <Sparkles className="inline-block h-4 w-4 mx-1"/> button to upload a bill (PDF/JPG/PNG). Gemini AI will read it and fill the form for you.</li>
            </ul>
          </Card>
        </div>

        <Card className="border-card-border/70 bg-card/70 p-6 shadow-sm">
           <h2 className="font-semibold text-lg mb-6">Sales History (from Firestore)</h2>
           <div className="rounded-xl border bg-card overflow-hidden">
             <Table>
               <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetching ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading history...</TableCell></TableRow>
                ) : history.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center">No entries found.</TableCell></TableRow>
                ) : (
                  history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs">{entry.date}</TableCell>
                      <TableCell className="font-medium">{entry.customerName}</TableCell>
                      <TableCell>{entry.itemDescription}</TableCell>
                      <TableCell className="text-right font-semibold">{entry.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
