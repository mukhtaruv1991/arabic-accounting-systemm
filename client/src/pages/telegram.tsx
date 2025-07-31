import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Loader2, MessageCircle, Settings, CheckCircle, AlertCircle } from "lucide-react";

export default function TelegramPage() {
  const { toast } = useToast();
  const [testChatId, setTestChatId] = useState("");
  const [testMessage, setTestMessage] = useState("مرحباً! هذه رسالة تجريبية من نظام المحاسبة الذكي 🤖");
  const [webhookUrl, setWebhookUrl] = useState("");

  // Get bot info
  const { data: botInfo, isLoading: isBotInfoLoading } = useQuery({
    queryKey: ["/api/telegram/bot-info"],
    queryFn: async () => {
      const response = await fetch("/api/telegram/bot-info");
      if (!response.ok) throw new Error("فشل في الحصول على معلومات البوت");
      return response.json();
    }
  });

  // Test message mutation
  const testMessageMutation = useMutation({
    mutationFn: async ({ chatId, message }: { chatId: string; message: string }) => {
      const response = await fetch("/api/telegram/test-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message })
      });
      if (!response.ok) throw new Error("فشل في إرسال الرسالة");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "نجح الإرسال",
        description: "تم إرسال الرسالة التجريبية بنجاح"
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الإرسال",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Set webhook mutation
  const setWebhookMutation = useMutation({
    mutationFn: async (webhookUrl: string) => {
      const response = await fetch("/api/telegram/set-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl })
      });
      if (!response.ok) throw new Error("فشل في تعيين الويب هوك");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "نجح التعيين",
        description: "تم تعيين الويب هوك بنجاح"
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التعيين",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleTestMessage = () => {
    if (!testChatId.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال معرف المحادثة",
        variant: "destructive"
      });
      return;
    }
    testMessageMutation.mutate({ chatId: testChatId, message: testMessage });
  };

  const handleSetWebhook = () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط الويب هوك",
        variant: "destructive"
      });
      return;
    }
    setWebhookMutation.mutate(webhookUrl);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">إعدادات تيليجرام</h1>
          <p className="text-muted-foreground">إدارة وتكوين بوت تيليجرام للنظام</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bot Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              معلومات البوت
            </CardTitle>
            <CardDescription>
              معلومات حول بوت تيليجرام المكوّن حالياً
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isBotInfoLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري تحميل معلومات البوت...</span>
              </div>
            ) : botInfo?.ok ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">البوت متصل بنجاح</span>
                </div>
                <div className="grid gap-2 text-sm">
                  <div><strong>الاسم:</strong> {botInfo.result.first_name}</div>
                  <div><strong>اسم المستخدم:</strong> @{botInfo.result.username}</div>
                  <div><strong>المعرف:</strong> {botInfo.result.id}</div>
                  <div><strong>يمكن الانضمام للمجموعات:</strong> {botInfo.result.can_join_groups ? 'نعم' : 'لا'}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>فشل في الاتصال بالبوت</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Message */}
        <Card>
          <CardHeader>
            <CardTitle>إرسال رسالة تجريبية</CardTitle>
            <CardDescription>
              اختبر اتصال البوت بإرسال رسالة تجريبية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="chatId">معرف المحادثة (Chat ID)</Label>
              <Input
                id="chatId"
                placeholder="123456789"
                value={testChatId}
                onChange={(e) => setTestChatId(e.target.value)}
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">
                يمكنك الحصول على معرف المحادثة من @userinfobot في تيليجرام
              </p>
            </div>
            <div>
              <Label htmlFor="message">الرسالة</Label>
              <Input
                id="message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleTestMessage} 
              disabled={testMessageMutation.isPending}
              className="w-full"
            >
              {testMessageMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              إرسال رسالة تجريبية
            </Button>
          </CardContent>
        </Card>

        {/* Webhook Configuration */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>تكوين الويب هوك</CardTitle>
            <CardDescription>
              قم بتعيين رابط الويب هوك لاستقبال الرسائل من تيليجرام
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="webhookUrl">رابط الويب هوك</Label>
              <Input
                id="webhookUrl"
                placeholder="https://yourdomain.com/api/telegram/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">
                يجب أن يكون الرابط يدعم HTTPS ويشير إلى نقطة النهاية الخاصة بالويب هوك
              </p>
            </div>
            <Button 
              onClick={handleSetWebhook} 
              disabled={setWebhookMutation.isPending}
            >
              {setWebhookMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              تعيين الويب هوك
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>كيفية ربط الحساب</CardTitle>
            <CardDescription>
              خطوات ربط حساب المستخدم مع تيليجرام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>ابحث عن البوت في تيليجرام باستخدام اسم المستخدم: <code className="bg-muted px-1 rounded">@{botInfo?.result?.username || 'البوت'}</code></li>
              <li>ابدأ محادثة مع البوت بإرسال <code className="bg-muted px-1 rounded">/start</code></li>
              <li>احصل على معرف المحادثة الخاص بك من <code className="bg-muted px-1 rounded">@userinfobot</code></li>
              <li>أدخل معرف المحادثة في الحقل أعلاه واختبر الاتصال</li>
              <li>بعد التأكد من عمل البوت، يمكنك استخدام الأوامر العربية للمحاسبة</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}