
import { Router, type Application } from "express";
import { db, storage } from "./firebase";
import { gemini } from "./gemini";

// This function will be imported by server/index.ts to register all our API routes.
export function registerRoutes(app: Application) {
  const router = Router();

  // Gemini-powered data extraction for a transient (temporary) upload
  router.post("/extract-transient", async (req, res) => {
    const { storagePath } = req.body;
    if (!storagePath) {
      return res.status(400).json({ error: "storagePath is required." });
    }
    try {
      const fileRef = storage.bucket().file(storagePath);
      const [exists] = await fileRef.exists();
      if (!exists) {
        return res.status(404).json({ error: "Temporary file not found." });
      }

      const [fileBuffer] = await fileRef.download();
      const fileMimeType = (await fileRef.getMetadata())[0].contentType || 'application/pdf';

      const prompt = `You are an expert accountant specializing in Indian GST invoices. Analyze this invoice and extract the following fields in a clean, minified JSON format. Do not include any extra commentary or markdown. The fields to extract are: gstNumber, invoiceNumber, invoiceDate, partyName, totalAmount. If a field is not present, omit it from the JSON.`;
      
      const result = await gemini.generateContent([prompt, { inlineData: { data: fileBuffer.toString('base64'), mimeType: fileMimeType } }]);
      const responseText = result.response.text();
      const extractedData = JSON.parse(responseText.replace(/```json|```/g, '').trim());

      // Important: Delete the temporary file after extraction
      await fileRef.delete();

      return res.json(extractedData);

    } catch (error) {
      console.error(`[Gemini Transient Extraction Error]`, error);
      // Attempt to delete the file even if extraction fails
      try {
        await storage.bucket().file(storagePath).delete();
      } catch (delError) {
        console.error(`[Gemini Transient Cleanup Error]`, delError)
      }
      return res.status(500).json({ error: "Failed to extract data from the bill." });
    }
  });

  // Get all invoices
  router.get("/invoices", async (req, res) => {
    try {
      const snapshot = await db.collection('invoices').orderBy('createdAt', 'desc').get();
      const invoices: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        invoices.push({
          id: doc.id,
          ...data,
          // Safely format the date
          date: data.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000).toLocaleDateString('en-IN') : 'N/A',
        });
      });
      return res.json(invoices);
    } catch (error) {
      console.error("[Firestore Error]", error);
      return res.status(500).json({ error: "Could not fetch invoices." });
    }
  });

  // Create a manual invoice
  router.post("/invoices", async (req, res) => {
    const invoice = req.body;
    // Basic validation
    if (!invoice || !invoice.customerName || !invoice.totalAmount) {
        return res.status(400).json({ error: "Missing required invoice fields." });
    }
    try {
      // Use Firestore server timestamp for consistency
      const payload = { ...invoice, createdAt: new Date() };
      const docRef = await db.collection('invoices').add(payload);
      const newDoc = await docRef.get();
      const newDocData = newDoc.data();
      
      return res.status(201).json({ 
          id: docRef.id, 
          ...newDocData,
          date: newDocData?.createdAt?._seconds ? new Date(newDocData.createdAt._seconds * 1000).toLocaleDateString('en-IN') : 'N/A',
      });
    } catch (error) {
      console.error("[Firestore Error]", error);
      return res.status(500).json({ error: "Could not save invoice." });
    }
  });

  // Mount the router on the /api path
  app.use("/api", router);
}
