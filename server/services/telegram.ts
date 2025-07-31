import { storage } from "../storage";
import { aiService } from "./ai";
import { randomUUID } from "crypto";

// Telegram Bot Service
export class TelegramBotService {
  private botToken: string;
  private webhookUrl: string;
  private apiUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || "8095604439:AAHD9GlgGgCpVVCMLp-thNsfbn8I0gqk_Do";
    this.webhookUrl = process.env.WEBHOOK_URL || "";
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  async handleMessage(chatId: string, message: string, userId?: string): Promise<string> {
    try {
      // Get user by telegram chat ID
      const users = await this.getAllUsers();
      const user = users.find(u => u.telegramId === chatId);
      
      if (!user) {
        return "مرحباً! يرجى ربط حسابك أولاً عبر الموقع الإلكتروني.";
      }

      // Get user's organizations
      const organizations = await storage.getUserOrganizations(user.id);
      if (organizations.length === 0) {
        return "لا توجد شركات مرتبطة بحسابك.";
      }

      const currentOrg = organizations[0]; // Use first organization for now

      // Process AI command
      const aiResult = await aiService.processArabicCommand(message, {
        userId: user.id,
        organizationId: currentOrg.id
      });

      // Execute the action based on AI analysis
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

  private async getAllUsers() {
    // This is a simplified method - in real implementation would query properly
    return [];
  }

  private async createSalesEntry(organizationId: string, userId: string, params: any) {
    const accounts = await storage.getAccounts(organizationId);
    const salesAccount = accounts.find(acc => acc.name.includes('مبيعات'));
    const cashAccount = accounts.find(acc => acc.name.includes('خزنة') || acc.name.includes('نقد'));

    if (!salesAccount || !cashAccount) {
      throw new Error('Required accounts not found');
    }

    // Generate a temporary entry ID for the details
    const tempEntryId = randomUUID();

    await storage.createJournalEntry(
      {
        organizationId,
        description: params.description,
        entryDate: new Date(),
        totalAmount: params.amount.toString(),
        createdBy: userId,
        reference: 'Telegram Bot'
      },
      [
        {
          entryId: tempEntryId,
          accountId: cashAccount.id,
          debit: params.amount.toString(),
          credit: "0",
          description: 'نقدية من المبيعات'
        },
        {
          entryId: tempEntryId,
          accountId: salesAccount.id,
          debit: "0",
          credit: params.amount.toString(),
          description: 'إيرادات مبيعات'
        }
      ]
    );
  }

  private async createExpenseEntry(organizationId: string, userId: string, params: any) {
    const accounts = await storage.getAccounts(organizationId);
    const expenseAccount = accounts.find(acc => acc.type === 'expense');
    const cashAccount = accounts.find(acc => acc.name.includes('خزنة') || acc.name.includes('نقد'));

    if (!expenseAccount || !cashAccount) {
      throw new Error('Required accounts not found');
    }

    // Generate a temporary entry ID for the details
    const tempEntryId = randomUUID();

    await storage.createJournalEntry(
      {
        organizationId,
        description: params.description,
        entryDate: new Date(),
        totalAmount: params.amount.toString(),
        createdBy: userId,
        reference: 'Telegram Bot'
      },
      [
        {
          entryId: tempEntryId,
          accountId: expenseAccount.id,
          debit: params.amount.toString(),
          credit: "0",
          description: 'مصروفات'
        },
        {
          entryId: tempEntryId,
          accountId: cashAccount.id,
          debit: "0",
          credit: params.amount.toString(),
          description: 'دفع نقدي'
        }
      ]
    );
  }

  private async getBalanceInfo(organizationId: string): Promise<string> {
    const stats = await storage.getDashboardStats(organizationId);
    
    return `الإيرادات: ${stats.totalRevenue.toLocaleString()} ريال
المصروفات: ${stats.totalExpenses.toLocaleString()} ريال
صافي الربح: ${stats.netProfit.toLocaleString()} ريال
الرصيد النقدي: ${stats.cashBalance.toLocaleString()} ريال`;
  }

  async sendMessage(chatId: string, message: string, keyboard?: any): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
          reply_markup: keyboard || this.getMainMenuKeyboard(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Message sent to ${chatId}: ${message.substring(0, 50)}...`);
    } catch (error) {
      console.error('Error sending Telegram message:', error);
    }
  }

  getMainMenuKeyboard() {
    return {
      keyboard: [
        ['📊 لوحة التحكم', '📝 قيد جديد'],
        ['📋 التقارير', '👥 العملاء'],
        ['💰 الحسابات', '⚙️ الإعدادات']
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    };
  }

  async setWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query'],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set webhook: ${response.status}`);
      }

      const result = await response.json();
      console.log('Webhook set successfully:', result);
      return true;
    } catch (error) {
      console.error('Error setting webhook:', error);
      return false;
    }
  }

  async getBotInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/getMe`);
      if (!response.ok) {
        throw new Error(`Failed to get bot info: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting bot info:', error);
      return null;
    }
  }
}

export const telegramBotService = new TelegramBotService();
