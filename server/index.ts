
import express, { type Application, type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";

const app: Application = express();

// Middleware for logging
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// --- App Initialization ---
(async () => {
  // Register all the /api routes
  registerRoutes(app);

  // In production, serve the built client files. In development, this is handled by Vite.
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    // In development, we use Vite's dev server. The setupVite function will handle this.
    const { setupVite } = await import("./vite");
    await setupVite(app); // Note: No more httpServer needed
  }

  // Centralized error handling
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err.stack);
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // Start the server
  const port = parseInt(process.env.PORT || "5000", 10);
  app.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });

})();
