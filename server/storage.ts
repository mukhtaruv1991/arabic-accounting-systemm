import { 
  type User, type InsertUser, type Organization, type InsertOrganization,
  type Account, type InsertAccount, type JournalEntry, type InsertJournalEntry,
  type JournalEntryDetail, type InsertJournalEntryDetail, type Contact, type InsertContact,
  type Invoice, type InsertInvoice, type Notification, type InsertNotification,
  type ChatMessage, type InsertChatMessage, type Membership
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Organizations
  getOrganization(id: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getUserOrganizations(userId: string): Promise<Organization[]>;

  // Memberships
  createMembership(userId: string, organizationId: string, role: string): Promise<Membership>;
  getUserMembership(userId: string, organizationId: string): Promise<Membership | undefined>;

  // Accounts
  getAccounts(organizationId: string): Promise<Account[]>;
  getAccount(id: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: string, account: Partial<InsertAccount>): Promise<Account | undefined>;

  // Journal Entries
  getJournalEntries(organizationId: string): Promise<(JournalEntry & { details: JournalEntryDetail[] })[]>;
  getJournalEntry(id: string): Promise<(JournalEntry & { details: JournalEntryDetail[] }) | undefined>;
  createJournalEntry(entry: InsertJournalEntry, details: InsertJournalEntryDetail[]): Promise<JournalEntry>;

  // Contacts
  getContacts(organizationId: string): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;

  // Invoices
  getInvoices(organizationId: string): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;

  // Notifications
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;

  // Chat Messages
  getChatMessages(organizationId: string, userId?: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Dashboard Stats
  getDashboardStats(organizationId: string): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    cashBalance: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private organizations: Map<string, Organization> = new Map();
  private memberships: Map<string, Membership> = new Map();
  private accounts: Map<string, Account> = new Map();
  private journalEntries: Map<string, JournalEntry> = new Map();
  private journalEntryDetails: Map<string, JournalEntryDetail[]> = new Map();
  private contacts: Map<string, Contact> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private chatMessages: Map<string, ChatMessage> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default organization
    const orgId = randomUUID();
    const defaultOrg: Organization = {
      id: orgId,
      name: "شركة الأمل للتجارة",
      currency: "SAR",
      createdAt: new Date(),
    };
    this.organizations.set(orgId, defaultOrg);

    // Create default user
    const userId = randomUUID();
    const defaultUser: User = {
      id: userId,
      username: "admin",
      password: "admin123", // In production, this should be hashed
      email: "admin@company.com",
      fullName: "أحمد محمد",
      telegramId: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(userId, defaultUser);

    // Create membership
    const membershipId = randomUUID();
    const defaultMembership: Membership = {
      id: membershipId,
      userId,
      organizationId: orgId,
      role: "owner",
      createdAt: new Date(),
    };
    this.memberships.set(membershipId, defaultMembership);

    // Create default chart of accounts
    this.createDefaultAccounts(orgId);
  }

  private createDefaultAccounts(organizationId: string) {
    const defaultAccounts = [
      { code: "1000", name: "الأصول", type: "asset", parentId: null },
      { code: "1100", name: "الأصول المتداولة", type: "asset", parentId: null },
      { code: "1110", name: "النقدية وما في حكمها", type: "asset", parentId: null },
      { code: "1111", name: "الخزنة الرئيسية", type: "asset", parentId: null, balance: "10000" },
      { code: "1112", name: "البنك الأهلي", type: "asset", parentId: null, balance: "85500" },
      { code: "1200", name: "العملاء", type: "asset", parentId: null, balance: "125000" },
      { code: "2000", name: "الخصوم", type: "liability", parentId: null },
      { code: "2100", name: "الموردين", type: "liability", parentId: null, balance: "45000" },
      { code: "3000", name: "حقوق الملكية", type: "equity", parentId: null },
      { code: "4000", name: "الإيرادات", type: "revenue", parentId: null },
      { code: "4100", name: "إيرادات المبيعات", type: "revenue", parentId: null },
      { code: "5000", name: "المصروفات", type: "expense", parentId: null },
      { code: "5100", name: "مصروفات إدارية", type: "expense", parentId: null },
    ];

    defaultAccounts.forEach(acc => {
      const account: Account = {
        id: randomUUID(),
        organizationId,
        code: acc.code,
        name: acc.name,
        type: acc.type as any,
        parentId: acc.parentId,
        isActive: true,
        balance: acc.balance || "0",
        createdAt: new Date(),
      };
      this.accounts.set(account.id, account);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updateData };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    const id = randomUUID();
    const org: Organization = { ...insertOrg, id, createdAt: new Date() };
    this.organizations.set(id, org);
    return org;
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const userMemberships = Array.from(this.memberships.values())
      .filter(m => m.userId === userId);
    
    return userMemberships.map(m => this.organizations.get(m.organizationId)).filter(Boolean) as Organization[];
  }

  async createMembership(userId: string, organizationId: string, role: string): Promise<Membership> {
    const id = randomUUID();
    const membership: Membership = {
      id,
      userId,
      organizationId,
      role,
      createdAt: new Date(),
    };
    this.memberships.set(id, membership);
    return membership;
  }

  async getUserMembership(userId: string, organizationId: string): Promise<Membership | undefined> {
    return Array.from(this.memberships.values())
      .find(m => m.userId === userId && m.organizationId === organizationId);
  }

  async getAccounts(organizationId: string): Promise<Account[]> {
    return Array.from(this.accounts.values())
      .filter(account => account.organizationId === organizationId);
  }

  async getAccount(id: string): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = randomUUID();
    const account: Account = { 
      ...insertAccount, 
      id, 
      balance: "0",
      createdAt: new Date() 
    };
    this.accounts.set(id, account);
    return account;
  }

  async updateAccount(id: string, updateData: Partial<InsertAccount>): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (account) {
      const updatedAccount = { ...account, ...updateData };
      this.accounts.set(id, updatedAccount);
      return updatedAccount;
    }
    return undefined;
  }

  async getJournalEntries(organizationId: string): Promise<(JournalEntry & { details: JournalEntryDetail[] })[]> {
    const entries = Array.from(this.journalEntries.values())
      .filter(entry => entry.organizationId === organizationId);
    
    return entries.map(entry => ({
      ...entry,
      details: this.journalEntryDetails.get(entry.id) || []
    }));
  }

  async getJournalEntry(id: string): Promise<(JournalEntry & { details: JournalEntryDetail[] }) | undefined> {
    const entry = this.journalEntries.get(id);
    if (entry) {
      return {
        ...entry,
        details: this.journalEntryDetails.get(id) || []
      };
    }
    return undefined;
  }

  async createJournalEntry(insertEntry: InsertJournalEntry, details: InsertJournalEntryDetail[]): Promise<JournalEntry> {
    const id = randomUUID();
    const entryNumber = `JE-${Date.now()}`;
    
    const entry: JournalEntry = {
      ...insertEntry,
      id,
      entryNumber,
      createdAt: new Date(),
    };
    
    this.journalEntries.set(id, entry);
    
    const entryDetails = details.map(detail => ({
      ...detail,
      id: randomUUID(),
      entryId: id,
    }));
    
    this.journalEntryDetails.set(id, entryDetails);
    
    // Update account balances
    for (const detail of entryDetails) {
      const account = this.accounts.get(detail.accountId);
      if (account) {
        const currentBalance = parseFloat(account.balance);
        const debit = parseFloat(detail.debit) || 0;
        const credit = parseFloat(detail.credit) || 0;
        
        let newBalance = currentBalance;
        if (account.type === 'asset' || account.type === 'expense') {
          newBalance += debit - credit;
        } else {
          newBalance += credit - debit;
        }
        
        account.balance = newBalance.toString();
        this.accounts.set(account.id, account);
      }
    }
    
    return entry;
  }

  async getContacts(organizationId: string): Promise<Contact[]> {
    return Array.from(this.contacts.values())
      .filter(contact => contact.organizationId === organizationId);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = { ...insertContact, id, createdAt: new Date() };
    this.contacts.set(id, contact);
    return contact;
  }

  async getInvoices(organizationId: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values())
      .filter(invoice => invoice.organizationId === organizationId);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = randomUUID();
    const invoiceNumber = `INV-${Date.now()}`;
    const invoice: Invoice = { 
      ...insertInvoice, 
      id, 
      invoiceNumber,
      createdAt: new Date() 
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = { ...insertNotification, id, createdAt: new Date() };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
  }

  async getChatMessages(organizationId: string, userId?: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.organizationId === organizationId);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { ...insertMessage, id, createdAt: new Date() };
    this.chatMessages.set(id, message);
    return message;
  }

  async getDashboardStats(organizationId: string): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    cashBalance: number;
  }> {
    const accounts = await this.getAccounts(organizationId);
    
    const revenueAccounts = accounts.filter(acc => acc.type === 'revenue');
    const expenseAccounts = accounts.filter(acc => acc.type === 'expense');
    const cashAccounts = accounts.filter(acc => 
      acc.name.includes('نقد') || acc.name.includes('بنك') || acc.name.includes('خزنة')
    );
    
    const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
    const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
    const cashBalance = cashAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
    const netProfit = totalRevenue - totalExpenses;
    
    return {
      totalRevenue: Math.abs(totalRevenue),
      totalExpenses: Math.abs(totalExpenses),
      netProfit,
      cashBalance,
    };
  }
}

export const storage = new MemStorage();
