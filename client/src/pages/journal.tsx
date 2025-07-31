import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Plus, FileText, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const journalEntryDetailSchema = z.object({
  accountId: z.string().min(1, "الحساب مطلوب"),
  debit: z.string().optional(),
  credit: z.string().optional(),
  description: z.string().optional(),
});

const journalEntrySchema = z.object({
  organizationId: z.string(),
  description: z.string().min(1, "وصف القيد مطلوب"),
  entryDate: z.string().min(1, "تاريخ القيد مطلوب"),
  reference: z.string().optional(),
  details: z.array(journalEntryDetailSchema).min(2, "يجب إضافة حساب واحد على الأقل في المدين والدائن"),
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

export default function JournalPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentOrganization, user } = useAuth();
  const { toast } = useToast();

  const { data: journalEntries, isLoading } = useQuery({
    queryKey: ['/api/journal-entries', currentOrganization?.id],
    enabled: !!currentOrganization,
  });

  const { data: accounts } = useQuery({
    queryKey: ['/api/accounts', currentOrganization?.id],
    enabled: !!currentOrganization,
  });

  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      organizationId: currentOrganization?.id || '',
      description: '',
      entryDate: new Date().toISOString().split('T')[0],
      reference: '',
      details: [
        { accountId: '', debit: '', credit: '', description: '' },
        { accountId: '', debit: '', credit: '', description: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const createJournalEntryMutation = useMutation({
    mutationFn: api.createJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries', currentOrganization?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts', currentOrganization?.id] });
      toast({
        title: "تم إنشاء القيد بنجاح",
        description: "تم إضافة القيد الجديد إلى السجل المحاسبي",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنشاء القيد",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JournalEntryFormData) => {
    if (!currentOrganization || !user) return;

    // Validate that debits equal credits
    const totalDebits = data.details.reduce((sum, detail) => sum + parseFloat(detail.debit || '0'), 0);
    const totalCredits = data.details.reduce((sum, detail) => sum + parseFloat(detail.credit || '0'), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      toast({
        title: "خطأ في الرصيد",
        description: "إجمالي المدين يجب أن يساوي إجمالي الدائن",
        variant: "destructive",
      });
      return;
    }

    const entryData = {
      entry: {
        organizationId: currentOrganization.id,
        description: data.description,
        entryDate: new Date(data.entryDate),
        reference: data.reference,
        createdBy: user.id,
      },
      details: data.details.map(detail => ({
        accountId: detail.accountId,
        debit: detail.debit || '0',
        credit: detail.credit || '0',
        description: detail.description,
      })),
    };

    createJournalEntryMutation.mutate(entryData);
  };

  const addDetailRow = () => {
    append({ accountId: '', debit: '', credit: '', description: '' });
  };

  const removeDetailRow = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const getAccountName = (accountId: string) => {
    const account = accounts?.find(acc => acc.id === accountId);
    return account ? `${account.code} - ${account.name}` : '';
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
          <h1 className="text-2xl font-bold text-gray-900">القيود المحاسبية</h1>
          <p className="text-gray-600">إدارة وتسجيل العمليات المالية</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-500 hover:bg-primary-600">
              <Plus className="ml-2 h-4 w-4" />
              قيد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء قيد محاسبي جديد</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف القيد</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="مثال: قيد مبيعات نقدية" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="entryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ القيد</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المرجع (اختياري)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: فاتورة رقم 123" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">تفاصيل القيد</h3>
                    <Button type="button" onClick={addDetailRow} variant="outline" size="sm">
                      <Plus className="ml-1 h-4 w-4" />
                      إضافة سطر
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الحساب</TableHead>
                          <TableHead>الوصف</TableHead>
                          <TableHead>مدين</TableHead>
                          <TableHead>دائن</TableHead>
                          <TableHead>إجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field, index) => (
                          <TableRow key={field.id}>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`details.${index}.accountId`}
                                render={({ field }) => (
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر الحساب" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {accounts?.map((account) => (
                                        <SelectItem key={account.id} value={account.id}>
                                          {account.code} - {account.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`details.${index}.description`}
                                render={({ field }) => (
                                  <Input {...field} placeholder="وصف العملية" />
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`details.${index}.debit`}
                                render={({ field }) => (
                                  <Input {...field} type="number" step="0.01" placeholder="0.00" />
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`details.${index}.credit`}
                                render={({ field }) => (
                                  <Input {...field} type="number" step="0.01" placeholder="0.00" />
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDetailRow(index)}
                                disabled={fields.length <= 2}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary-500 hover:bg-primary-600"
                    disabled={createJournalEntryMutation.isPending}
                  >
                    {createJournalEntryMutation.isPending ? "جاري الحفظ..." : "حفظ القيد"}
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
            <FileText className="h-5 w-5" />
            سجل القيود المحاسبية
          </CardTitle>
        </CardHeader>
        <CardContent>
          {journalEntries && journalEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم القيد</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>المرجع</TableHead>
                  <TableHead>المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journalEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.entryNumber}</TableCell>
                    <TableCell>
                      {new Date(entry.entryDate).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>{entry.reference || '-'}</TableCell>
                    <TableCell>{parseFloat(entry.totalAmount).toLocaleString()} ر.س</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد قيود محاسبية</h3>
              <p className="text-gray-600 mb-4">ابدأ بإنشاء أول قيد محاسبي</p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-primary-500 hover:bg-primary-600"
              >
                <Plus className="ml-2 h-4 w-4" />
                إنشاء قيد جديد
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
