// ------------------- بداية الكود المنسوخ -------------------

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// vvvvvvvvvvvvvvvvvvvv  هنا التعديل المهم vvvvvvvvvvvvvvvvvvvv
(async () => {
  // --- أسطر التصحيح المضافة ---
  console.log(">>>> [DEBUG] Starting application...");
  console.log(">>>> [DEBUG] Checking environment variables...");
  console.log(">>>> [DEBUG] DATABASE_URL is set:", !!process.env.DATABASE_URL);
  console.log(">>>> [DEBUG] TELEGRAM_BOT_TOKEN is set:", !!process.env.TELEGRAM_BOT_TOKEN);
  console.log(">>>> [DEBUG] NODE_ENV is:", process.env.NODE_ENV);
  // -----------------------------

  try {
    console.log(">>>> [DEBUG] Calling registerRoutes...");
    const server = await registerRoutes(app);
    console.log(">>>> [DEBUG] registerRoutes finished successfully.");

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    if (app.get("env") === "development") {
      console.log(">>>> [DEBUG] Setting up Vite for development...");
      await setupVite(app, server);
    } else {
      console.log(">>>> [DEBUG] Serving static files for production...");
      serveStatic(app);
    }

    const port = parseInt(process.env.PORT || '5000', 10);
    console.log(`>>>> [DEBUG] Preparing to listen on port ${port}`);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });

  } catch (error) {
    console.error(">>>> [FATAL ERROR] An error occurred during startup:", error);
    process.exit(1); // تأكد من إنهاء العملية عند حدوث خطأ فادح
  }
})();
// ^^^^^^^^^^^^^^^^^^^^ نهاية التعديل المهم ^^^^^^^^^^^^^^^^^^^^

// ------------------- نهاية الكود المنسوخ -------------------
