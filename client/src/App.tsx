import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./hooks/use-auth";
import { Sidebar } from "./components/layout/sidebar";
import { Header } from "./components/layout/header";
import LoginPage from "./pages/login";
import Dashboard from "./pages/dashboard";
import AccountsPage from "./pages/accounts";
import JournalPage from "./pages/journal";
import ReportsPage from "./pages/reports";
import UsersPage from "./pages/users";
import TelegramPage from "./pages/telegram";
import NotFound from "@/pages/not-found";
import { useState } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('/dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setCurrentPage('/dashboard')} />;
  }

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      <Sidebar onNavigate={setCurrentPage} />
      <div className="flex-1 mr-64">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Switch>
            <Route path="/" component={() => <Dashboard />} />
            <Route path="/dashboard" component={() => <Dashboard />} />
            <Route path="/accounts" component={() => <AccountsPage />} />
            <Route path="/journal" component={() => <JournalPage />} />
            <Route path="/reports" component={() => <ReportsPage />} />
            <Route path="/users" component={() => <UsersPage />} />
            <Route path="/telegram" component={() => <TelegramPage />} />
            <Route path="/invoices" component={() => <div className="p-6"><h1 className="text-2xl font-bold">الفواتير - قريباً</h1></div>} />
            <Route path="/chat" component={() => <div className="p-6"><h1 className="text-2xl font-bold">المحادثات الداخلية - قريباً</h1></div>} />
            <Route path="/backup" component={() => <div className="p-6"><h1 className="text-2xl font-bold">النسخ الاحتياطية - قريباً</h1></div>} />
            <Route path="/settings" component={() => <div className="p-6"><h1 className="text-2xl font-bold">الإعدادات - قريباً</h1></div>} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
