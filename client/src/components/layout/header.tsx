import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Bell, Bot, Wifi } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [aiCommand, setAiCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentOrganization } = useAuth();
  const { toast } = useToast();

  const handleAICommand = async () => {
    if (!aiCommand.trim() || !currentOrganization) return;

    setIsProcessing(true);
    try {
      const result = await api.processAICommand(aiCommand, {
        organizationId: currentOrganization.id
      });

      toast({
        title: "تم تحليل الأمر",
        description: result.response,
        variant: result.confidence > 0.7 ? "default" : "destructive"
      });

      if (result.confidence > 0.7) {
        setAiCommand("");
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في معالجة الأمر",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAICommand();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Online/Offline Status */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary-500 rounded-full"></div>
            <span className="text-sm text-gray-600">متصل</span>
          </div>
          
          {/* AI Command Input */}
          <div className="relative">
            <Input
              type="text"
              placeholder="اكتب أمرك بالعربية... مثل: سجل مبيعات بقيمة 1000 ريال"
              value={aiCommand}
              onChange={(e) => setAiCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-96 bg-gray-50 focus:ring-2 focus:ring-primary-500"
              disabled={isProcessing}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 hover:text-primary-600"
              onClick={handleAICommand}
              disabled={isProcessing || !aiCommand.trim()}
            >
              <Bot className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              5
            </Badge>
          </Button>

          {/* Telegram Bot Status */}
          <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 rounded-lg">
            <Bot className="h-4 w-4 text-primary-500" />
            <span className="text-sm text-primary-600">بوت نشط</span>
          </div>

          {/* Language Toggle */}
          <Button variant="outline" size="sm">
            EN | العربية
          </Button>
        </div>
      </div>
    </header>
  );
}
