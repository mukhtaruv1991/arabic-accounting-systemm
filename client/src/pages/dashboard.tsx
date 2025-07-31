import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Wallet, PlusCircle, FileText, BarChart3, Users } from "lucide-react";

export default function Dashboard() {
  const { currentOrganization } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard', currentOrganization?.id],
    enabled: !!currentOrganization,
  });

  const { data: accounts } = useQuery({
    queryKey: ['/api/accounts', currentOrganization?.id],
    enabled: !!currentOrganization,
  });

  const { data: journalEntries } = useQuery({
    queryKey: ['/api/journal-entries', currentOrganization?.id],
    enabled: !!currentOrganization,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ر.س`;
  };

  // Mock recent transactions from journal entries
  const recentTransactions = journalEntries?.slice(0, 3) || [];

  const mainAccounts = [
    { name: 'البنك الأهلي', balance: 85500, icon: '🏦' },
    { name: 'الخزنة الرئيسية', balance: 10000, icon: '💰' },
    { name: 'العملاء', balance: 125000, icon: '🤝' },
    { name: 'الموردين', balance: -45000, icon: '🚚' },
  ];

  return (
    <div className="p-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="إجمالي الإيرادات"
          value={formatCurrency(stats?.totalRevenue || 450000)}
          change="+12% من الشهر الماضي"
          changeType="positive"
          icon={<TrendingUp className="text-secondary-500 text-xl" />}
          iconBgColor="bg-secondary-50"
        />
        
        <StatCard
          title="إجمالي المصروفات"
          value={formatCurrency(stats?.totalExpenses || 280000)}
          change="+5% من الشهر الماضي"
          changeType="negative"
          icon={<TrendingDown className="text-red-500 text-xl" />}
          iconBgColor="bg-red-50"
        />
        
        <StatCard
          title="صافي الربح"
          value={formatCurrency(stats?.netProfit || 170000)}
          change="+18% من الشهر الماضي"
          changeType="positive"
          icon={<BarChart3 className="text-primary-500 text-xl" />}
          iconBgColor="bg-primary-50"
        />
        
        <StatCard
          title="الرصيد النقدي"
          value={formatCurrency(stats?.cashBalance || 95500)}
          change="في البنوك والخزائن"
          changeType="neutral"
          icon={<Wallet className="text-accent-500 text-xl" />}
          iconBgColor="bg-accent-50"
        />
      </div>

      {/* Quick Actions and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-primary-50 hover:bg-primary-100 text-primary-700" variant="ghost">
                <PlusCircle className="ml-2 h-4 w-4 text-primary-500" />
                إنشاء قيد محاسبي جديد
              </Button>
              <Button className="w-full justify-start bg-secondary-50 hover:bg-secondary-100 text-secondary-700" variant="ghost">
                <FileText className="ml-2 h-4 w-4 text-secondary-500" />
                إنشاء فاتورة جديدة
              </Button>
              <Button className="w-full justify-start bg-accent-50 hover:bg-accent-100 text-accent-700" variant="ghost">
                <BarChart3 className="ml-2 h-4 w-4 text-accent-500" />
                عرض التقارير المالية
              </Button>
              <Button className="w-full justify-start bg-gray-50 hover:bg-gray-100 text-gray-700" variant="ghost">
                <Users className="ml-2 h-4 w-4 text-gray-500" />
                إدارة المستخدمين
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card className="border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">آخر المعاملات</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary-500 hover:text-primary-600">
                  عرض الكل
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary-50 rounded-lg flex items-center justify-center">
                        <TrendingUp className="text-secondary-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entry.description}</p>
                        <p className="text-sm text-gray-500">قيد رقم: {entry.entryNumber}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-secondary-600">{formatCurrency(parseFloat(entry.totalAmount))}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p>لا توجد معاملات حديثة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <RevenueChart />

        {/* Account Balances */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">أرصدة الحسابات الرئيسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mainAccounts.map((account) => (
              <div key={account.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                    <span className="text-sm">{account.icon}</span>
                  </div>
                  <span className="text-gray-700">{account.name}</span>
                </div>
                <span className={`font-semibold ${account.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatCurrency(Math.abs(account.balance))}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
