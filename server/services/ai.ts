// AI service for processing Arabic natural language commands
export class AIService {
  private geminiApiKey: string;

  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "default_key";
  }

  async processArabicCommand(command: string, context: any = {}): Promise<{
    action: string;
    parameters: any;
    confidence: number;
    response: string;
  }> {
    // For now, implement basic pattern matching
    // In production, this would call Gemini AI API
    
    const normalizedCommand = command.toLowerCase().trim();
    
    // Sales transaction patterns
    if (normalizedCommand.includes('مبيعات') || normalizedCommand.includes('بيع')) {
      const amountMatch = normalizedCommand.match(/(\d+(?:\.\d+)?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
      
      return {
        action: 'create_sales_entry',
        parameters: {
          amount,
          description: command,
          type: 'sales'
        },
        confidence: 0.85,
        response: `تم تحليل الأمر: إنشاء قيد مبيعات بقيمة ${amount} ريال`
      };
    }
    
    // Expense transaction patterns
    if (normalizedCommand.includes('مصروف') || normalizedCommand.includes('صرف')) {
      const amountMatch = normalizedCommand.match(/(\d+(?:\.\d+)?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
      
      return {
        action: 'create_expense_entry',
        parameters: {
          amount,
          description: command,
          type: 'expense'
        },
        confidence: 0.85,
        response: `تم تحليل الأمر: إنشاء قيد مصروفات بقيمة ${amount} ريال`
      };
    }
    
    // Balance inquiry patterns
    if (normalizedCommand.includes('رصيد') || normalizedCommand.includes('كشف حساب')) {
      return {
        action: 'get_account_balance',
        parameters: {
          query: command
        },
        confidence: 0.90,
        response: 'سيتم عرض رصيد الحساب المطلوب'
      };
    }
    
    // Default response
    return {
      action: 'unknown',
      parameters: {},
      confidence: 0.0,
      response: 'عذراً، لم أتمكن من فهم الأمر. يرجى المحاولة مرة أخرى بصيغة أوضح.'
    };
  }

  async getSuggestions(input: string, type: 'account' | 'contact' | 'general'): Promise<string[]> {
    // Basic suggestion logic - in production would use AI
    const suggestions: Record<string, string[]> = {
      account: [
        'حساب المبيعات النقدية',
        'حساب المشتريات',
        'حساب المصروفات الإدارية',
        'حساب البنك الأهلي',
        'حساب الخزنة الرئيسية'
      ],
      contact: [
        'شركة النور التجارية',
        'مؤسسة الأمل للمقاولات',
        'شركة الفجر للاستيراد',
        'مكتب المحاماة المتقدم'
      ],
      general: [
        'إنشاء قيد محاسبي جديد',
        'عرض التقارير المالية',
        'إضافة عميل جديد',
        'عرض كشف حساب'
      ]
    };
    
    const typeItems = suggestions[type] || suggestions.general;
    return typeItems.filter(item => 
      item.toLowerCase().includes(input.toLowerCase())
    );
  }
}

export const aiService = new AIService();
