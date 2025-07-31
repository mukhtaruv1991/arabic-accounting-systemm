import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface RevenueChartProps {
  data?: any[];
}

export function RevenueChart({ data = [] }: RevenueChartProps) {
  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          الإيرادات مقابل المصروفات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>رسم بياني للإيرادات والمصروفات</p>
            <p className="text-sm mt-1">سيتم تطوير الرسوم البيانية قريباً</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
