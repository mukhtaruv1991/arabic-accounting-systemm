import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, TreePine } from "lucide-react";

const accountSchema = z.object({
  organizationId: z.string(),
  code: z.string().min(1, "كود الحساب مطلوب"),
  name: z.string().min(1, "اسم الحساب مطلوب"),
  type: z.string().min(1, "نوع الحساب مطلوب"),
  parentId: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

const accountTypes = [
  { value: 'asset', label: 'أصول' },
  { value: 'liability', label: 'خصوم' },
  { value: 'equity', label: 'حقوق الملكية' },
  { value: 'revenue', label: 'إيرادات' },
  { value: 'expense', label: 'مصروفات' },
];

export default function AccountsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentOrganization } = useAuth();
  const { toast } = useToast();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['/api/accounts', currentOrganization?.id],
    enabled: !!currentOrganization,
  });

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      organizationId: currentOrganization?.id || '',
      code: '',
      name: '',
      type: '',
      parentId: '',
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: api.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts', currentOrganization?.id] });
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "تم إضافة الحساب الجديد إلى دليل الحسابات",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء الحساب",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AccountFormData) => {
    if (!currentOrganization) return;
    
    const accountData = {
      ...data,
      organizationId: currentOrganization.id,
      parentId: data.parentId || null,
    };
    
    createAccountMutation.mutate(accountData);
  };

  const formatBalance = (balance: string) => {
    const amount = parseFloat(balance);
    return `${amount.toLocaleString()} ر.س`;
  };

  const getAccountTypeLabel = (type: string) => {
    return accountTypes.find(t => t.value === type)?.label || type;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">دليل الحسابات</h1>
          <p className="text-gray-600">إدارة حسابات الشركة والهيكل المحاسبي</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-500 hover:bg-primary-600">
              <Plus className="ml-2 h-4 w-4" />
              إضافة حساب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة حساب جديد</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كود الحساب</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: 1110" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الحساب</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: البنك الأهلي" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع الحساب</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع الحساب" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accountTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحساب الرئيسي (اختياري)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الحساب الرئيسي" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">بدون حساب رئيسي</SelectItem>
                          {accounts?.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.code} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary-500 hover:bg-primary-600"
                    disabled={createAccountMutation.isPending}
                  >
                    {createAccountMutation.isPending ? "جاري الإنشاء..." : "إنشاء الحساب"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5" />
            قائمة الحسابات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accounts && accounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>كود الحساب</TableHead>
                  <TableHead>اسم الحساب</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الرصيد</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.code}</TableCell>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>{getAccountTypeLabel(account.type)}</TableCell>
                    <TableCell className={parseFloat(account.balance) < 0 ? 'text-red-600' : 'text-gray-900'}>
                      {formatBalance(account.balance)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        account.isActive 
                          ? 'bg-secondary-50 text-secondary-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {account.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <TreePine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حسابات</h3>
              <p className="text-gray-600 mb-4">ابدأ بإنشاء حساب جديد لبناء دليل الحسابات</p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-primary-500 hover:bg-primary-600"
              >
                <Plus className="ml-2 h-4 w-4" />
                إضافة حساب جديد
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
