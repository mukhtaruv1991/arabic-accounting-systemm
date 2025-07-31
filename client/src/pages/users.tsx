import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, UserPlus, Shield, Settings, Mail, Phone, Calendar } from "lucide-react";

const userSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صحيح"),
  fullName: z.string().min(1, "الاسم الكامل مطلوب"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  role: z.string().min(1, "الدور مطلوب"),
  telegramId: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

const userRoles = [
  { value: 'owner', label: 'مالك', description: 'صلاحيات كاملة' },
  { value: 'admin', label: 'مدير', description: 'صلاحيات إدارية' },
  { value: 'accountant', label: 'محاسب', description: 'العمليات المحاسبية' },
  { value: 'employee', label: 'موظف', description: 'صلاحيات محدودة' },
  { value: 'viewer', label: 'مشاهد', description: 'عرض فقط' },
];

const permissions = [
  { category: 'المحاسبة', items: [
    { key: 'accounts_view', label: 'عرض الحسابات' },
    { key: 'accounts_create', label: 'إنشاء حسابات' },
    { key: 'accounts_edit', label: 'تعديل حسابات' },
    { key: 'accounts_delete', label: 'حذف حسابات' },
  ]},
  { category: 'القيود', items: [
    { key: 'journal_view', label: 'عرض القيود' },
    { key: 'journal_create', label: 'إنشاء قيود' },
    { key: 'journal_edit', label: 'تعديل قيود' },
    { key: 'journal_delete', label: 'حذف قيود' },
  ]},
  { category: 'التقارير', items: [
    { key: 'reports_view', label: 'عرض التقارير' },
    { key: 'reports_export', label: 'تصدير التقارير' },
    { key: 'reports_advanced', label: 'التقارير المتقدمة' },
  ]},
  { category: 'الإدارة', items: [
    { key: 'users_view', label: 'عرض المستخدمين' },
    { key: 'users_create', label: 'إنشاء مستخدمين' },
    { key: 'users_edit', label: 'تعديل مستخدمين' },
    { key: 'users_delete', label: 'حذف مستخدمين' },
    { key: 'settings_manage', label: 'إدارة الإعدادات' },
  ]},
];

// Mock users data - in production this would come from API
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@company.com',
    fullName: 'أحمد محمد',
    role: 'owner',
    isActive: true,
    telegramId: '@ahmad_admin',
    lastLogin: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    username: 'sara_acc',
    email: 'sara@company.com',
    fullName: 'سارة أحمد',
    role: 'accountant',
    isActive: true,
    telegramId: '@sara_accountant',
    lastLogin: '2024-01-14T16:45:00Z',
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: '3',
    username: 'mohammed_emp',
    email: 'mohammed@company.com',
    fullName: 'محمد علي',
    role: 'employee',
    isActive: false,
    telegramId: null,
    lastLogin: '2024-01-10T09:15:00Z',
    createdAt: '2024-01-10T00:00:00Z',
  },
];

export default function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("users");
  const { currentOrganization, user } = useAuth();
  const { toast } = useToast();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      password: '',
      role: '',
      telegramId: '',
    },
  });

  const onSubmit = (data: UserFormData) => {
    // In production, this would call the API
    console.log('Creating user:', data);
    toast({
      title: "تم إنشاء المستخدم بنجاح",
      description: `تم إضافة ${data.fullName} إلى النظام`,
    });
    setIsDialogOpen(false);
    form.reset();
  };

  const getRoleLabel = (role: string) => {
    return userRoles.find(r => r.value === role)?.label || role;
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      owner: "destructive",
      admin: "default",
      accountant: "secondary",
      employee: "outline",
      viewer: "outline",
    };
    return variants[role] || "outline";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'منذ أقل من ساعة';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
          <p className="text-gray-600">إدارة المستخدمين والصلاحيات في النظام</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-500 hover:bg-primary-600">
              <Plus className="ml-2 h-4 w-4" />
              إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة مستخدم جديد</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: أحمد محمد" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المستخدم</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: ahmad_mohammed" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="مثال: ahmad@company.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="كلمة مرور قوية" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الدور</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الدور" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div>
                                <div className="font-medium">{role.label}</div>
                                <div className="text-sm text-gray-500">{role.description}</div>
                              </div>
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
                  name="telegramId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>معرف تيليجرام (اختياري)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: @username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary-500 hover:bg-primary-600"
                  >
                    إنشاء المستخدم
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            المستخدمين
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            الأدوار والصلاحيات
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            سجل النشاط
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                قائمة المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>آخر تسجيل دخول</TableHead>
                    <TableHead>تيليجرام</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user.fullName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.fullName}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatLastLogin(user.lastLogin)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.telegramId ? (
                          <span className="text-sm text-primary-600">{user.telegramId}</span>
                        ) : (
                          <span className="text-sm text-gray-400">غير مربوط</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={user.isActive} />
                          <span className={`text-sm ${user.isActive ? 'text-secondary-600' : 'text-gray-500'}`}>
                            {user.isActive ? 'نشط' : 'معطل'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            تعديل
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            حذف
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  الأدوار المتاحة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userRoles.map((role) => (
                  <div key={role.value} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{role.label}</h4>
                      <Badge variant={getRoleBadgeVariant(role.value)}>
                        {role.value}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مصفوفة الصلاحيات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {permissions.map((category) => (
                    <div key={category.category}>
                      <h4 className="font-medium text-gray-900 mb-3">{category.category}</h4>
                      <div className="space-y-2">
                        {category.items.map((permission) => (
                          <div key={permission.key} className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-700">{permission.label}</span>
                            <div className="flex items-center gap-2">
                              <Switch defaultChecked />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                سجل النشاط
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">قريباً</h3>
                <p className="text-gray-600">سيتم إضافة سجل النشاط والتدقيق قريباً</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
