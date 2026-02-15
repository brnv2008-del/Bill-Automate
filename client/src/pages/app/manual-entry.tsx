import { useState, useMemo } from "react";
import TopNav from "@/components/app/top-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Save, Plus, History, IndianRupee } from "lucide-react";

type SaleEntry = {
  id: string;
  customerName: string;
  gstNumber: string;
  itemDescription: string;
  quantity: number;
  price: number;
  gstRate: number;
  totalAmount: number;
  date: string;
};

export default function ManualEntryPage() {
  const [customerName, setCustomerName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [gstRate, setGstRate] = useState("18");

  // Local state persistence for mockup
  const [history, setHistory] = useState<SaleEntry[]>(() => {
    try {
      const saved = localStorage.getItem("autogst.manual_entries");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const totalAmount = useMemo(() => {
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(price) || 0;
    const r = parseFloat(gstRate) || 0;
    const subtotal = q * p;
    const gstAmount = subtotal * (r / 100);
    return subtotal + gstAmount;
  }, [quantity, price, gstRate]);

  const handleSave = () => {
    if (!customerName || !itemDescription || !price) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: SaleEntry = {
      id: Math.random().toString(36).substr(2, 9),
      customerName,
      gstNumber,
      itemDescription,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      gstRate: parseFloat(gstRate),
      totalAmount,
      date: new Date().toLocaleDateString(),
    };

    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("autogst.manual_entries", JSON.stringify(updatedHistory));

    // Reset form
    setItemDescription("");
    setQuantity("1");
    setPrice("");
    
    toast({
      title: "Sale saved",
      description: `Entry for ${customerName} has been recorded locally.`,
    });
  };

  return (
    <div>
      <TopNav />
      
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-manual-entry-title">Manual Entry</h1>
            <p className="text-sm text-muted-foreground">Create invoices manually like GimBooks.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1.5 text-xs text-amber-600 shadow-xs">
            <History className="h-3.5 w-3.5" />
            Local Storage Only
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-card-border/70 bg-card/70 p-6 shadow-sm backdrop-blur ag-noise">
            <div className="flex items-center gap-2 mb-6 text-primary">
              <Plus className="h-5 w-5" />
              <h2 className="font-semibold text-lg">New Invoice Entry</h2>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input 
                  id="customerName" 
                  placeholder="e.g. Reliance Industries" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  data-testid="input-customer-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input 
                  id="gstNumber" 
                  placeholder="22AAAAA0000A1Z5" 
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  data-testid="input-gst-number"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="description">Item Description *</Label>
                <Input 
                  id="description" 
                  placeholder="e.g. Consulting Services" 
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  data-testid="input-item-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  data-testid="input-quantity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (Per Item) *</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="price" 
                    type="number" 
                    className="pl-9" 
                    placeholder="0.00" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    data-testid="input-price"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>GST Rate (%)</Label>
                <Select value={gstRate} onValueChange={setGstRate}>
                  <SelectTrigger data-testid="select-gst-rate">
                    <SelectValue placeholder="Select Rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="18">18%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="sm:col-span-2 mt-4 rounded-xl bg-primary/5 p-4 border border-primary/10">
                <div className="flex items-center justify-between text-lg font-semibold text-primary">
                  <span>Total Amount (Inc. GST)</span>
                  <span data-testid="text-total-amount">₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="sm:col-span-2 pt-2">
                <Button className="w-full h-11" onClick={handleSave} data-testid="button-save-entry">
                  <Save className="mr-2 h-4 w-4" />
                  Save Entry
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border-card-border/70 bg-card/70 p-6 shadow-sm backdrop-blur h-fit">
            <h3 className="font-semibold mb-4">Quick Help</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                Enter customer details and GST number for B2B invoices.
              </li>
              <li className="flex gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                Select the appropriate GST rate as per HSN category.
              </li>
              <li className="flex gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                Saved entries will appear in the Sales History below.
              </li>
            </ul>
          </Card>
        </div>

        <Card className="border-card-border/70 bg-card/70 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold text-lg">Sales History</h2>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                localStorage.removeItem("autogst.manual_entries");
                setHistory([]);
                toast({ title: "History cleared" });
              }}
              disabled={history.length === 0}
            >
              Clear History
            </Button>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Total (Incl. GST)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No manual entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((entry, idx) => (
                    <TableRow key={entry.id} data-testid={`row-sale-${idx}`}>
                      <TableCell className="text-xs">{entry.date}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span data-testid={`text-sale-customer-${idx}`}>{entry.customerName}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{entry.gstNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm" data-testid={`text-sale-item-${idx}`}>{entry.itemDescription}</TableCell>
                      <TableCell className="text-right">{entry.quantity}</TableCell>
                      <TableCell className="text-right">{entry.gstRate}%</TableCell>
                      <TableCell className="text-right font-semibold text-primary" data-testid={`text-sale-total-${idx}`}>
                        ₹ {entry.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
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
