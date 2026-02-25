
import { useState, useEffect } from "react";
import TopNav from "@/components/app/top-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

type ConsolidatedData = {
  id: string;
  source: 'Manual' | 'Gemini';
  gstNumber: string;
  invoiceNumber: string;
  date: string;
  partyName: string;
  hsnCode: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxRate: number;
  totalAmount: number;
};

export default function ReportsPage() {
  const [data, setData] = useState<ConsolidatedData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyName, setCompanyName] = useState("SUPREME ENTERPRISES"); // Default company name

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [invoicesRes, uploadsRes] = await Promise.all([
          fetch("/api/invoices"),
          fetch("/api/uploads?status=Extracted"),
        ]);

        if (!invoicesRes.ok || !uploadsRes.ok) throw new Error("Failed to fetch data.");

        const manualInvoices = await invoicesRes.json();
        const extractedUploads = await uploadsRes.json();

        const consolidated: ConsolidatedData[] = [];

        manualInvoices.forEach((inv: any) => {
          const total = inv.totalAmount;
          const rate = (inv.gstRate || 0) / 100;
          const taxable = rate > 0 ? total / (1 + rate) : total;
          const gst = total - taxable;

          consolidated.push({
            id: inv.id, source: 'Manual', gstNumber: inv.gstNumber || 'N/A', invoiceNumber: inv.id, date: inv.date,
            partyName: inv.customerName, hsnCode: 'N/A', taxableValue: taxable, cgst: gst / 2, sgst: gst / 2,
            igst: 0, taxRate: inv.gstRate || 0, totalAmount: inv.totalAmount,
          });
        });

        extractedUploads.forEach((upl: any) => {
          if (upl.extractedData) {
            const taxable = parseFloat(upl.extractedData.taxableValue) || 0;
            const total = parseFloat(upl.extractedData.totalAmount) || 0;
            const gst = total - taxable;
            const rate = taxable > 0 ? (gst / taxable) * 100 : 0;

            consolidated.push({
              id: upl.id, source: 'Gemini', gstNumber: upl.extractedData.gstNumber || 'N/A',
              invoiceNumber: upl.extractedData.invoiceNumber || 'N/A', date: upl.extractedData.invoiceDate || new Date(upl.uploadedAt).toLocaleDateString(),
              partyName: upl.extractedData.partyName || 'N/A', hsnCode: upl.extractedData.hsnCode || 'N/A',
              taxableValue: taxable, cgst: parseFloat(upl.extractedData.cgst) || 0, sgst: parseFloat(upl.extractedData.sgst) || 0,
              igst: parseFloat(upl.extractedData.igst) || 0, taxRate: Math.round(rate), totalAmount: total,
            });
          }
        });
        
        consolidated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setData(consolidated);
      } catch (err) {
        toast({ title: "Error fetching reports", description: (err as Error).message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);
  
  function handleExport() {
    if (data.length === 0) {
      toast({ title: "No data to export", variant: "secondary"});
      return;
    }

    const reportMonth = `FOR THE MONTH OF ${new Date().toLocaleString('default', { month: 'long' }).toUpperCase()} - ${new Date().getFullYear()}`;
    const mainTableHeaders = ["S.NO", "GST NO", "NAME OF THE PARTY", "INVOICE NO", "DATE", "HSN CODE", "BASIC", "CGST", "SGST", "IGST", "TOTALS"];
    
    // Main data table rows
    const mainTableRows = data.map((row, index) => [
        index + 1, row.gstNumber, row.partyName, row.invoiceNumber, row.date, row.hsnCode,
        row.taxableValue, row.cgst, row.sgst, row.igst, row.totalAmount
    ]);

    // Calculate main totals
    const totalRow = [ "", "", "", "", "", "Total", data.reduce((s, r) => s + r.taxableValue, 0), data.reduce((s, r) => s + r.cgst, 0),
                       data.reduce((s, r) => s + r.sgst, 0), data.reduce((s, r) => s + r.igst, 0), data.reduce((s, r) => s + r.totalAmount, 0) ];

    // HSN Summary calculation
    const hsnSummary: { [key: string]: { taxRate: number, taxableValue: number, cgst: number, sgst: number, igst: number, total: number } } = {};
    data.forEach(row => {
      if (row.hsnCode !== 'N/A') {
        if (!hsnSummary[row.hsnCode]) {
          hsnSummary[row.hsnCode] = { taxRate: row.taxRate, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
        }
        hsnSummary[row.hsnCode].taxableValue += row.taxableValue;
        hsnSummary[row.hsnCode].cgst += row.cgst;
        hsnSummary[row.hsnCode].sgst += row.sgst;
        hsnSummary[row.hsnCode].igst += row.igst;
        hsnSummary[row.hsnCode].total += row.totalAmount;
      }
    });

    const hsnSummaryHeaders = ["HSN CODE", "TAX %", "BASIC", "CGST", "SGST", "IGST", "TOTAL"];
    const hsnSummaryRows = Object.keys(hsnSummary).map(hsn => [
      hsn, `${hsnSummary[hsn].taxRate}%`, hsnSummary[hsn].taxableValue, hsnSummary[hsn].cgst, hsnSummary[hsn].sgst, hsnSummary[hsn].igst, hsnSummary[hsn].total
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([]);
    
    // Add titles and merge
    XLSX.utils.sheet_add_aoa(worksheet, [[companyName]], { origin: "A1" });
    worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: mainTableHeaders.length - 1 } }];
    worksheet["A1"].s = { font: { name: 'Calibri', sz: 16, bold: true }, alignment: { horizontal: "center" } };
    XLSX.utils.sheet_add_aoa(worksheet, [[reportMonth]], { origin: "A2" });
    worksheet["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: mainTableHeaders.length - 1 } });
    worksheet["A2"].s = { font: { name: 'Calibri', sz: 14, bold: true }, alignment: { horizontal: "center" } };

    // Add main table
    XLSX.utils.sheet_add_aoa(worksheet, [mainTableHeaders], { origin: "A4" });
    XLSX.utils.sheet_add_aoa(worksheet, mainTableRows, { origin: "A5" });
    const mainTableEndRow = 5 + mainTableRows.length;
    XLSX.utils.sheet_add_aoa(worksheet, [totalRow], { origin: `A${mainTableEndRow}` });

    // Add HSN Summary table
    const hsnSummaryStartRow = mainTableEndRow + 2;
    XLSX.utils.sheet_add_aoa(worksheet, [["HSN Summary"]], { origin: `A${hsnSummaryStartRow}` });
    worksheet[`A${hsnSummaryStartRow}`].s = { font: { bold: true } };
    XLSX.utils.sheet_add_aoa(worksheet, [hsnSummaryHeaders], { origin: `A${hsnSummaryStartRow + 1}` });
    XLSX.utils.sheet_add_aoa(worksheet, hsnSummaryRows, { origin: `A${hsnSummaryStartRow + 2}` });

    worksheet["!cols"] = [ { wch: 5 }, { wch: 18 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 } ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    XLSX.writeFile(workbook, "sales_report.xlsx");

    toast({ title: "Success!", description: "Downloaded sales_report.xlsx" });
  }

  return (
    <div>
      <TopNav />
      <div className="grid gap-6">
        <h1 className="text-2xl font-semibold">Consolidated GST Report</h1>

        <Card className="border-card-border/70 bg-card/70 p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="font-semibold text-lg">Export Settings</h2>
              <p className="text-sm text-muted-foreground">Customize your Excel report.</p>
            </div>
            <div className="grid gap-4">
                <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Enter your company name" />
                </div>
                <Button onClick={handleExport} disabled={isLoading || data.length === 0} className="w-full md:w-auto justify-self-end">
                    <Download className="mr-2 h-4 w-4" />
                    Export as Formatted Excel
                </Button>
            </div>
          </div>
        </Card>

        <Card className="border-card-border/70 bg-card/70 p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Report Preview</h2>
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead> <TableHead>Inv #</TableHead> <TableHead>Date</TableHead> <TableHead>Party</TableHead> <TableHead>HSN</TableHead> <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center">Generating report...</TableCell></TableRow>
                ) : data.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center">No data.</TableCell></TableRow>
                ) : (
                  data.map(row => (
                    <TableRow key={row.id}>
                      <TableCell><Badge variant={row.source === 'Gemini' ? 'default' : 'secondary'}>{row.source}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{row.invoiceNumber}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell className="font-medium">{row.partyName}</TableCell>
                      <TableCell className="font-mono text-xs">{row.hsnCode}</TableCell>
                      <TableCell className="text-right font-semibold">{row.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
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
