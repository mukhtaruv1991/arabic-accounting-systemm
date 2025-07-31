import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./services/ai";
import { telegramBotService } from "./services/telegram";
import { 
  insertUserSchema, insertOrganizationSchema, insertAccountSchema,
  insertJournalEntrySchema, insertContactSchema, insertInvoiceSchema,
  insertNotificationSchema, insertChatMessageSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
      }

      const organizations = await storage.getUserOrganizations(user.id);
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName
        },
        organizations
      });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "اسم المستخدم مُستخدم بالفعل" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json({ user });
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  // Organization routes
  app.get("/api/organizations/:userId", async (req, res) => {
    try {
      const organizations = await storage.getUserOrganizations(req.params.userId);
      res.json(organizations);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الشركات" });
    }
  });

  app.post("/api/organizations", async (req, res) => {
    try {
      const orgData = insertOrganizationSchema.parse(req.body);
      const { userId, role = 'owner' } = req.body;
      
      const organization = await storage.createOrganization(orgData);
      await storage.createMembership(userId, organization.id, role);
      
      res.status(201).json(organization);
    } catch (error) {
      res.status(400).json({ message: "فشل في إنشاء الشركة" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/:organizationId", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.params.organizationId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب بيانات لوحة التحكم" });
    }
  });

  // Accounts routes
  app.get("/api/accounts/:organizationId", async (req, res) => {
    try {
      const accounts = await storage.getAccounts(req.params.organizationId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الحسابات" });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const accountData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      res.status(400).json({ message: "فشل في إنشاء الحساب" });
    }
  });

  // Journal entries routes
  app.get("/api/journal-entries/:organizationId", async (req, res) => {
    try {
      const entries = await storage.getJournalEntries(req.params.organizationId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب القيود" });
    }
  });

  app.post("/api/journal-entries", async (req, res) => {
    try {
      const { entry, details } = req.body;
      const entryData = insertJournalEntrySchema.parse(entry);
      
      // Validate that debits equal credits
      const totalDebits = details.reduce((sum: number, d: any) => sum + parseFloat(d.debit || 0), 0);
      const totalCredits = details.reduce((sum: number, d: any) => sum + parseFloat(d.credit || 0), 0);
      
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        return res.status(400).json({ message: "إجمالي المدين يجب أن يساوي إجمالي الدائن" });
      }

      entryData.totalAmount = totalDebits.toString();
      const journalEntry = await storage.createJournalEntry(entryData, details);
      
      res.status(201).json(journalEntry);
    } catch (error) {
      res.status(400).json({ message: "فشل في إنشاء القيد" });
    }
  });

  // Contacts routes
  app.get("/api/contacts/:organizationId", async (req, res) => {
    try {
      const contacts = await storage.getContacts(req.params.organizationId);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب جهات الاتصال" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ message: "فشل في إنشاء جهة الاتصال" });
    }
  });

  // Invoices routes
  app.get("/api/invoices/:organizationId", async (req, res) => {
    try {
      const invoices = await storage.getInvoices(req.params.organizationId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الفواتير" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      res.status(400).json({ message: "فشل في إنشاء الفاتورة" });
    }
  });

  // AI Natural Language Processing
  app.post("/api/ai/process", async (req, res) => {
    try {
      const { command, context } = req.body;
      const result = await aiService.processArabicCommand(command, context);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "خطأ في معالجة الأمر" });
    }
  });

  app.get("/api/ai/suggestions", async (req, res) => {
    try {
      const { input, type } = req.query;
      const suggestions = await aiService.getSuggestions(
        input as string, 
        type as 'account' | 'contact' | 'general'
      );
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الاقتراحات" });
    }
  });

  // Notifications routes
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.params.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الإشعارات" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      res.status(400).json({ message: "فشل في إنشاء الإشعار" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "خطأ في تحديث الإشعار" });
    }
  });

  // Chat routes
  app.get("/api/chat/:organizationId", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.organizationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الرسائل" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "فشل في إرسال الرسالة" });
    }
  });

  // Telegram webhook
  app.post("/api/telegram/webhook", async (req, res) => {
    try {
      const { message } = req.body;
      if (message && message.text) {
        const response = await telegramBotService.handleMessage(
          message.chat.id.toString(),
          message.text,
          message.from?.id?.toString()
        );
        
        await telegramBotService.sendMessage(message.chat.id.toString(), response);
      }
      res.json({ ok: true });
    } catch (error) {
      console.error('Telegram webhook error:', error);
      res.status(500).json({ message: "خطأ في معالجة رسالة تيليجرام" });
    }
  });

  // Telegram bot management
  app.get("/api/telegram/bot-info", async (req, res) => {
    try {
      const botInfo = await telegramBotService.getBotInfo();
      res.json(botInfo);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الحصول على معلومات البوت" });
    }
  });

  app.post("/api/telegram/set-webhook", async (req, res) => {
    try {
      const { webhookUrl } = req.body;
      const result = await telegramBotService.setWebhook(webhookUrl);
      if (result) {
        res.json({ success: true, message: "تم تعيين الويب هوك بنجاح" });
      } else {
        res.status(400).json({ success: false, message: "فشل في تعيين الويب هوك" });
      }
    } catch (error) {
      res.status(500).json({ message: "خطأ في تعيين الويب هوك" });
    }
  });

  app.post("/api/telegram/test-message", async (req, res) => {
    try {
      const { chatId, message } = req.body;
      await telegramBotService.sendMessage(chatId, message || "مرحباً! هذه رسالة تجريبية من نظام المحاسبة الذكي 🤖");
      res.json({ success: true, message: "تم إرسال الرسالة بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "فشل في إرسال الرسالة" });
    }
  });

  // Reports routes
  app.get("/api/reports/trial-balance/:organizationId", async (req, res) => {
    try {
      const accounts = await storage.getAccounts(req.params.organizationId);
      
      const trialBalance = accounts.map(account => ({
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        debit: parseFloat(account.balance) > 0 ? parseFloat(account.balance) : 0,
        credit: parseFloat(account.balance) < 0 ? Math.abs(parseFloat(account.balance)) : 0,
      }));
      
      res.json(trialBalance);
    } catch (error) {
      res.status(500).json({ message: "خطأ في إنتاج ميزان المراجعة" });
    }
  });

  app.get("/api/reports/income-statement/:organizationId", async (req, res) => {
    try {
      const accounts = await storage.getAccounts(req.params.organizationId);
      
      const revenueAccounts = accounts.filter(acc => acc.type === 'revenue');
      const expenseAccounts = accounts.filter(acc => acc.type === 'expense');
      
      const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + Math.abs(parseFloat(acc.balance)), 0);
      const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
      
      res.json({
        revenues: revenueAccounts.map(acc => ({
          name: acc.name,
          amount: Math.abs(parseFloat(acc.balance))
        })),
        expenses: expenseAccounts.map(acc => ({
          name: acc.name,
          amount: parseFloat(acc.balance)
        })),
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses
      });
    } catch (error) {
      res.status(500).json({ message: "خطأ في إنتاج قائمة الدخل" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
