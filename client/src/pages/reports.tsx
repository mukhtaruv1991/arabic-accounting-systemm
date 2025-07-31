import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileText, TrendingUp, TrendingDown, Download, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ReportsPage() {
  const { currentOrganization } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("current_month");

  const { data: trialBalance, isLoading: isTrialBalanceLoading } = useQuery({
    queryKey: ['/api/reports/trial-balance', currentOrganization?.id],
    enabled: !!currentOrganization,
  });

  const { data: incomeStatement, isLoading: isIncomeStatementLoading } = useQuery({
    queryKey: ['/api/reports/income-statement', currentOrganization?.id],
    enabled: !!currentOrganization,
  });

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ر.س`;
  };

  const getAccountTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      asset: 'أصول',
      liability: 'خصوم',
      equity: 'حقوق الملكية',
      revenue: 'إيرادات',
      expense: 'مصروفات',
    };
    return types[type] || type;
  };

  const exportReport = (reportType: string) => {
    // In production, this would generate and download the report
    console.log(`Exporting ${reportType} report`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير المالية</h1>
          <p className="text-gray-600">عرض وتحليل البيانات المالية للشركة</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">الشهر الحالي</SelectItem>
              <SelectItem value="last_month">الشهر الماضي</SelectItem>
              <SelectItem value="current_quarter">الربع الحالي</SelectItem>
              <SelectItem value="current_year">السنة الحالية</SelectItem>
              <SelectItem value="last_year">السنة الماضية</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            فترة مخصصة
          </Button>
        </div>
      </div>

      <Tabs defaultValue="trial-balance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trial-balance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            ميزان المراجعة
          </TabsTrigger>
          <TabsTrigger value="income-statement" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            قائمة الدخل
          </TabsTrigger>
          <TabsTrigger value="balance-sheet" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            الميزانية العامة
          </TabsTrigger>
          <TabsTrigger value="cash-flow" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            التدفق النقدي
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trial-balance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  ميزان المراجعة
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportReport('trial-balance')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  تصدير
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isTrialBalanceLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل البيانات...</p>
                  </div>
                </div>
              ) : trialBalance && trialBalance.length > 0 ? (
                <div className="space-y-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>كود الحساب</TableHead>
                        <TableHead>اسم الحساب</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead className="text-center">مدين</TableHead>
                        <TableHead className="text-center">دائن</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trialBalance.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.code}</TableCell>
                          <TableCell>{account.name}</TableCell>
                          <TableCell>{getAccountTypeLabel(account.type)}</TableCell>
                          <TableCell className="text-center">
                            {account.debit > 0 ? formatCurrency(account.debit) : '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {account.credit > 0 ? formatCurrency(account.credit) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4 max-w-md mr-auto">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">إجمالي المدين</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(trialBalance.reduce((sum, acc) => sum + acc.debit, 0))}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">إجمالي الدائن</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(trialBalance.reduce((sum, acc) => sum + acc.credit, 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بيانات</h3>
                  <p className="text-gray-600">لا توجد حسابات أو عمليات لإنتاج ميزان المراجعة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income-statement">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  قائمة الدخل
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportReport('income-statement')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  تصدير
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isIncomeStatementLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل البيانات...</p>
                  </div>
                </div>
              ) : incomeStatement ? (
                <div className="space-y-6">
                  {/* Revenue Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">الإيرادات</h3>
                    <div className="space-y-2">
                      {incomeStatement.revenues.map((revenue, index) => (
                        <div key={index} className="flex justify-between py-2">
                          <span className="text-gray-700">{revenue.name}</span>
                          <span className="font-medium text-secondary-600">
                            {formatCurrency(revenue.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between py-2 border-t font-semibold">
                        <span>إجمالي الإيرادات</span>
                        <span className="text-secondary-600">
                          {formatCurrency(incomeStatement.totalRevenue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expenses Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">المصروفات</h3>
                    <div className="space-y-2">
                      {incomeStatement.expenses.map((expense, index) => (
                        <div key={index} className="flex justify-between py-2">
                          <span className="text-gray-700">{expense.name}</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(expense.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between py-2 border-t font-semibold">
                        <span>إجمالي المصروفات</span>
                        <span className="text-red-600">
                          {formatCurrency(incomeStatement.totalExpenses)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Net Income */}
                  <div className="border-t-2 border-gray-300 pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>صافي الدخل</span>
                      <span className={incomeStatement.netIncome >= 0 ? 'text-secondary-600' : 'text-red-600'}>
                        {formatCurrency(Math.abs(incomeStatement.netIncome))}
                        {incomeStatement.netIncome < 0 && ' (خسارة)'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بيانات</h3>
                  <p className="text-gray-600">لا توجد إيرادات أو مصروفات لإنتاج قائمة الدخل</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                الميزانية العامة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">قريباً</h3>
                <p className="text-gray-600">سيتم إضافة تقرير الميزانية العامة قريباً</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                قائمة التدفق النقدي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingDown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">قريباً</h3>
                <p className="text-gray-600">سيتم إضافة تقرير التدفق النقدي قريباً</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
