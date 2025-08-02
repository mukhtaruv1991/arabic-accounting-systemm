import { storage } from "../storage";
import { aiService } from "./ai";
import { randomUUID } from "crypto";
import { log } from '../vite'; // تأكد من أن مسار الاستيراد هذا صحيح

class TelegramBotService {
  private botToken: string;
  private apiUrl: string;

  constructor(token: string) {
    // الآن، يتم تمرير التوكن بشكل صريح
    this.botToken = token;
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    log('TelegramBotService class instantiated.', 'TelegramService');
  }

  // --- جميع الدوال الأخرى تبقى كما هي ---
  // (handleMessage, sendMessage, getMainMenuKeyboard, etc.)

  async handleMessage(chatId: string, message: string, userId?: string): Promise<string> {
    try {
      const users = await this.getAllUsers();
      const user = users.find(u => u.telegramId === chatId);
      
      if (!user) {
        return "مرحباً! يرجى ربط حسابك أولاً عبر الموقع الإلكتروني.";
      }

      const organizations = await storage.getUserOrganizations(user.id);
      if (organizations.length === 0) {
        return "لا توجد شركات مرتبطة بحسابك.";
      }

      const currentOrg = organizations[0];

      const aiResult = await aiService.processArabicCommand(message, {
        userId: user.id,
        organizationId: currentOrg.id
      });

      let response = aiResult.response;

      switch (aiResult.action) {
        case 'create_sales_entry':
          await this.createSalesEntry(currentOrg.id, user.id, aiResult.parameters);
          response += "\n✅ تم إنشاء قيد المبيعات بنجاح.";
          break;
        case 'create_expense_entry':
          await this.createExpenseEntry(currentOrg.id, user.id, aiResult.parameters);
          response += "\n✅ تم إنشاء قيد المصروفات بنجاح.";
          break;
        case 'get_account_balance':
          const balanceInfo = await this.getBalanceInfo(currentOrg.id);
          response += `\n\n💰 معلومات الحسابات:\n${balanceInfo}`;
          break;
      }

      return response;
    } catch (error) {
      console.error('Telegram bot error:', error);
      return "حدث خطأ في معالجة الطلب. يرجى المحاولة مرة أخرى.";
    }
  }

  private async getAllUsers(): Promise<any[]> {
    return [];
  }

  private async createSalesEntry(organizationId: string, userId: string, params: any) {
    const accounts = await storage.getAccounts(organizationId);
    const salesAccount = accounts.find(acc => acc.name.includes('مبيعات'));
    const cashAccount = accounts.find(acc => acc.name.includes('خزنة') || acc.name.includes('نقد'));

    if (!salesAccount || !cashAccount) throw new Error('Required accounts not found');
    
    const tempEntryId = randomUUID();
    await storage.createJournalEntry({
        organizationId,
        description: params.description,
        entryDate: new Date(),
        totalAmount: params.amount.toString(),
        createdBy: userId,
        reference: 'Telegram Bot'
      }, [{
          entryId: tempEntryId,
          accountId: cashAccount.id,
          debit: params.amount.toString(),
          credit: "0",
          description: 'نقدية من المبيعات'
        }, {
          entryId: tempEntryId,
          accountId: salesAccount.id,
          debit: "0",
          credit: params.amount.toString(),
          description: 'إيرادات مبيعات'
        }
      ]);
  }

  private async createExpenseEntry(organizationId: string, userId: string, params: any) {
    const accounts = await storage.getAccounts(organizationId);
    const expenseAccount = accounts.find(acc => acc.type === 'expense');
    const cashAccount = accounts.find(acc => acc.name.includes('خزنة') || acc.name.includes('نقد'));

    if (!expenseAccount || !cashAccount) throw new Error('Required accounts not found');

    const tempEntryId = randomUUID();
    await storage.createJournalEntry({
        organizationId,
        description: params.description,
        entryDate: new Date(),
        totalAmount: params.amount.toString(),
        createdBy: userId,
        reference: 'Telegram Bot'
      }, [{
          entryId: tempEntryId,
          accountId: expenseAccount.id,
          debit: params.amount.toString(),
          credit: "0",
          description: 'مصروفات'
        }, {
          entryId: tempEntryId,
          accountId: cashAccount.id,
          debit: "0",
          credit: params.amount.toString(),
          description: 'دفع نقدي'
        }
      ]);
  }

  private async getBalanceInfo(organizationId: string): Promise<string> {
    const stats = await storage.getDashboardStats(organizationId);
    return `الإيرادات: ${stats.totalRevenue.toLocaleString()} ريال\nالمصروفات: ${stats.totalExpenses.toLocaleString()} ريال\nصافي الربح: ${stats.netProfit.toLocaleString()} ريال\nالرصيد النقدي: ${stats.cashBalance.toLocaleString()} ريال`;
  }

  async sendMessage(chatId: string, message: string, keyboard?: any): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
          reply_markup: keyboard || this.getMainMenuKeyboard(),
        }),
      });
      if (!response.ok) throw new Error(`Telegram API error: ${response.status}`);
    } catch (error) {
      console.error('Error sending Telegram message:', error);
    }
  }

  getMainMenuKeyboard() {
    return {
      keyboard: [['📊 لوحة التحكم', '📝 قيد جديد'], ['📋 التقارير', '👥 العملاء'], ['💰 الحسابات', '⚙️ الإعدادات']],
      resize_keyboard: true,
      one_time_keyboard: false
    };
  }

  async setWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message', 'callback_query'] }),
      });
      if (!response.ok) throw new Error(`Failed to set webhook: ${response.status}`);
      return true;
    } catch (error) {
      console.error('Error setting webhook:', error);
      return false;
    }
  }

  async getBotInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/getMe`);
      if (!response.ok) throw new Error(`Failed to get bot info: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting bot info:', error);
      return null;
    }
  }
}

// --- هذا هو الجزء الجديد والمهم ---

let serviceInstance: TelegramBotService | null = null;

/**
 * دالة لإنشاء وإرجاع نسخة واحدة من الخدمة (Singleton).
 * @returns {TelegramBotService}
 */
function getTelegramService(): TelegramBotService {
  if (serviceInstance) {
    return serviceInstance;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    // هذا الخطأ سيوقف التطبيق برسالة واضحة إذا لم يتم العثور على التوكن
    throw new Error("FATAL: TELEGRAM_BOT_TOKEN environment variable is not defined.");
  }

  serviceInstance = new TelegramBotService(token);
  return serviceInstance;
}

// نقوم بتصدير كائن يحتوي على "getters" لكل دالة
// هذا يضمن أن الخدمة لن يتم تهيئتها إلا عند استدعاء إحدى دوالها لأول مرة
export const telegramBotService = {
  handleMessage: (chatId: string, message: string, userId?: string) => getTelegramService().handleMessage(chatId, message, userId),
  sendMessage: (chatId: string, message: string, keyboard?: any) => getTelegramService().sendMessage(chatId, message, keyboard),
  setWebhook: (webhookUrl: string) => getTelegramService().setWebhook(webhookUrl),
  getBotInfo: () => getTelegramService().getBotInfo(),
};
