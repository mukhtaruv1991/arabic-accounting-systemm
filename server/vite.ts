import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * دالة لإعداد خادم Vite في بيئة التطوير (development).
 * تسمح بالتحديث السريع (Hot Module Replacement).
 */
export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        fileURLToPath(import.meta.url),
        "..",
        "..",
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

/**
 * دالة لخدمة الملفات الثابتة (static files) في بيئة الإنتاج (production).
 * هذه هي النسخة المعدلة لحل مشكلة 404.
 */
export function serveStatic(app: Express) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // المسار إلى مجلد الواجهة الأمامية المبني
  const distPath = path.resolve(__dirname, "public");
  log(`Serving static files from: ${distPath}`, "production");

  // التحقق من وجود مجلد البناء
  if (!fs.existsSync(distPath)) {
    log(`Error: Build directory not found at ${distPath}`, "production");
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // 1. خدمة الملفات الثابتة (js, css, images) من مجلد /assets
  // هذا يخبر Express بالبحث عن ملفات مثل /assets/index-xxxx.js
  app.use('/assets', express.static(path.resolve(distPath, 'assets')));

  // 2. لأي طلب آخر لا يبدأ بـ /api، أرسل ملف index.html الرئيسي
  // هذا هو ما يجعل تطبيق الصفحة الواحدة (SPA) مثل React يعمل بشكل صحيح
  // ويحل مشكلة 404 عند تحديث الصفحة.
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
