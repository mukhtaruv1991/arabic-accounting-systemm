import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // <-- إضافة مهمة
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

// لا تغييرات هنا
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
        fileURLToPath(import.meta.url), // استخدم fileURLToPath هنا أيضًا
        "..",
        "..", // نعود خطوتين للخلف من server/vite.ts
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

// ===== التعديل الرئيسي هنا =====
export function serveStatic(app: Express) {
  // __dirname غير موثوق دائمًا في ES Modules، لذا نستخدم هذه الطريقة
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // عند تشغيل الكود من `dist/index.js`، يكون `__dirname` هو `.../dist`
  // لذا المسار إلى مجلد الواجهة الأمامية هو `.../dist/public`
  const distPath = path.resolve(__dirname, "public");
  log(`Serving static files from: ${distPath}`, "production");

  if (!fs.existsSync(distPath)) {
    log(`Error: Build directory not found at ${distPath}`, "production");
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // 1. خدمة الملفات الثابتة (js, css, images)
  app.use(express.static(distPath));

  // 2. لأي طلب آخر لا يطابق ملفًا ثابتًا أو مسار API، أرسل index.html
  // هذا ضروري لعمل تطبيقات الصفحة الواحدة (SPA) مثل React
  app.get("*", (req, res) => {
    // تحقق من أن الطلب ليس لمسار API لتجنب إرسال HTML بدلاً من JSON
    if (!req.originalUrl.startsWith('/api/')) {
      res.sendFile(path.resolve(distPath, "index.html"));
    } else {
      // إذا كان الطلب لمسار API غير موجود، أرسل 404
      res.status(404).json({ message: "API endpoint not found" });
    }
  });
}
