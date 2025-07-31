import { apiRequest } from "./queryClient";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashBalance: number;
}

export interface AIProcessResult {
  action: string;
  parameters: any;
  confidence: number;
  response: string;
}

export const api = {
  // Authentication
  login: async (credentials: LoginCredentials) => {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    return response.json();
  },

  register: async (userData: any) => {
    const response = await apiRequest('POST', '/api/auth/register', userData);
    return response.json();
  },

  // Dashboard
  getDashboardStats: async (organizationId: string): Promise<DashboardStats> => {
    const response = await apiRequest('GET', `/api/dashboard/${organizationId}`);
    return response.json();
  },

  // Organizations
  getUserOrganizations: async (userId: string) => {
    const response = await apiRequest('GET', `/api/organizations/${userId}`);
    return response.json();
  },

  createOrganization: async (orgData: any) => {
    const response = await apiRequest('POST', '/api/organizations', orgData);
    return response.json();
  },

  // Accounts
  getAccounts: async (organizationId: string) => {
    const response = await apiRequest('GET', `/api/accounts/${organizationId}`);
    return response.json();
  },

  createAccount: async (accountData: any) => {
    const response = await apiRequest('POST', '/api/accounts', accountData);
    return response.json();
  },

  // Journal Entries
  getJournalEntries: async (organizationId: string) => {
    const response = await apiRequest('GET', `/api/journal-entries/${organizationId}`);
    return response.json();
  },

  createJournalEntry: async (entryData: any) => {
    const response = await apiRequest('POST', '/api/journal-entries', entryData);
    return response.json();
  },

  // AI Processing
  processAICommand: async (command: string, context: any = {}): Promise<AIProcessResult> => {
    const response = await apiRequest('POST', '/api/ai/process', { command, context });
    return response.json();
  },

  getSuggestions: async (input: string, type: 'account' | 'contact' | 'general') => {
    const response = await apiRequest('GET', `/api/ai/suggestions?input=${encodeURIComponent(input)}&type=${type}`);
    return response.json();
  },

  // Notifications
  getUserNotifications: async (userId: string) => {
    const response = await apiRequest('GET', `/api/notifications/${userId}`);
    return response.json();
  },

  createNotification: async (notificationData: any) => {
    const response = await apiRequest('POST', '/api/notifications', notificationData);
    return response.json();
  },

  markNotificationAsRead: async (id: string) => {
    const response = await apiRequest('PATCH', `/api/notifications/${id}/read`);
    return response.json();
  },

  // Chat
  getChatMessages: async (organizationId: string) => {
    const response = await apiRequest('GET', `/api/chat/${organizationId}`);
    return response.json();
  },

  sendChatMessage: async (messageData: any) => {
    const response = await apiRequest('POST', '/api/chat', messageData);
    return response.json();
  },

  // Reports
  getTrialBalance: async (organizationId: string) => {
    const response = await apiRequest('GET', `/api/reports/trial-balance/${organizationId}`);
    return response.json();
  },

  getIncomeStatement: async (organizationId: string) => {
    const response = await apiRequest('GET', `/api/reports/income-statement/${organizationId}`);
    return response.json();
  },

  // Contacts
  getContacts: async (organizationId: string) => {
    const response = await apiRequest('GET', `/api/contacts/${organizationId}`);
    return response.json();
  },

  createContact: async (contactData: any) => {
    const response = await apiRequest('POST', '/api/contacts', contactData);
    return response.json();
  },

  // Invoices
  getInvoices: async (organizationId: string) => {
    const response = await apiRequest('GET', `/api/invoices/${organizationId}`);
    return response.json();
  },

  createInvoice: async (invoiceData: any) => {
    const response = await apiRequest('POST', '/api/invoices', invoiceData);
    return response.json();
  },
};
