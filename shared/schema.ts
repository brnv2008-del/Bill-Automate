
export interface User {
  uid: string;
  businessName: string;
  email: string;
  username: string;
  createdAt: Date;
}

export type InvoiceStatus = "Verified" | "Edited" | "Pending";

export interface Invoice {
  invoiceNumber: string;
a
  date: Date;
  partyName: string;
  gstin: string;
  address: string;
  hsn: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGST: number;
  totalAmount: number;
  status: InvoiceStatus;
  month: string;
  financialYear: string;
  createdBy: string; // User UID
  createdAt: Date;
}

export interface Report {
  // Define report structure
}

export interface Template {
  // Define template structure
}
