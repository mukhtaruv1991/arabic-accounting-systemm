import { useAuth } from "@/hooks/use-auth";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calculator, Home, BookOpen, FileText, BarChart3, Users, MessageCircle, Database, Settings, LogOut, Send } from "lucide-react";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  onNavigate: (path: string) => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user, organizations, currentOrganization, logout, switchOrganization } = useAuth();
  const [location] = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'لوحة التحكم', icon: Home },
    { path: '/accounts', label: 'دليل الحسابات', icon: BookOpen },
    { path: '/journal', label: 'القيود المحاسبية', icon: FileText },
    { path: '/invoices', label: 'الفواتير', icon: FileText },
    { path: '/reports', label: 'التقارير المالية', icon: BarChart3 },
    { path: '/users', label: 'إدارة المستخدمين', icon: Users },
    { path: '/telegram', label: 'بوت تيليجرام', icon: Send },
    { path: '/chat', label: 'المحادثات الداخلية', icon: MessageCircle },
    { path: '/backup', label: 'النسخ الاحتياطية', icon: Database },
    { path: '/settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-l border-gray-200 fixed h-full z-30">
      {/* Logo and Company Selector */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <Calculator className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {currentOrganization?.name || 'شركة الأمل للتجارة'}
            </h1>
            <p className="text-sm text-gray-500">نظام المحاسبة الذكي</p>
          </div>
        </div>
        
        {/* Company Selector */}
        <Select 
          value={currentOrganization?.id || ''} 
          onValueChange={(value) => {
            const org = organizations.find(o => o.id === value);
            if (org) switchOrganization(org);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="اختر الشركة" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location === item.path;
            
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <button 
                    onClick={() => onNavigate(item.path)}
                    className={`flex items-center gap-3 p-3 w-full text-right rounded-lg transition-colors group ${
                      isActive 
                        ? 'bg-primary-500 text-white' 
                        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                    }`}
                  >
                    <IconComponent className={`text-lg ${isActive ? 'text-white' : 'group-hover:text-primary-600'}`} />
                    <span>{item.label}</span>
                    {item.path === '/chat' && (
                      <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full mr-auto">3</span>
                    )}
                  </button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {user?.fullName?.charAt(0) || 'أ'}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{user?.fullName || 'أحمد محمد'}</p>
            <p className="text-xs text-gray-500">مدير مالي</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-gray-400 hover:text-gray-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
