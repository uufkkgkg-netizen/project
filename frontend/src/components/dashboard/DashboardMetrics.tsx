import { Users, Calendar, HeartPulse, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBoundary } from "react-error-boundary";

type DashboardMetricsProps = {
  totalPatients: number;
  pregnantPatients: number;
  dailyAppointments: number;
  monthlyRevenue: number;
  currency?: string;
};

function ErrorFallback() {
  return (
    <div className="col-span-full h-24 rounded-3xl border border-red-200 bg-red-50 flex items-center justify-center text-red-600">
      <p>حدث خطأ في تحميل الإحصائيات.</p>
    </div>
  );
}

function DashboardMetricsContent({
  totalPatients,
  pregnantPatients,
  dailyAppointments,
  monthlyRevenue,
  currency = "IQD",
}: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Patients */}
      <Card className="rounded-2xl border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-semibold text-slate-500">إجمالي المرضى</CardTitle>
          <div className="h-10 w-10 rounded-xl bg-blue-50/80 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-800">{totalPatients}</div>
          <p className="text-xs text-slate-400 mt-1 font-medium">مرضى مسجلين بالعيادة</p>
        </CardContent>
      </Card>

      {/* 2. Pregnant Patients */}
      <Card className="rounded-2xl border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-semibold text-slate-500">حالات الحمل</CardTitle>
          <div className="h-10 w-10 rounded-xl bg-pink-50/80 flex items-center justify-center">
            <HeartPulse className="h-5 w-5 text-pink-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-800">{pregnantPatients}</div>
          <p className="text-xs text-slate-400 mt-1 font-medium">متابعة حمل نشطة</p>
        </CardContent>
      </Card>

      {/* 3. Daily Appointments */}
      <Card className="rounded-2xl border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-semibold text-slate-500">مواعيد اليوم</CardTitle>
          <div className="h-10 w-10 rounded-xl bg-purple-50/80 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-800">{dailyAppointments}</div>
          <p className="text-xs text-slate-400 mt-1 font-medium">مجدولة لليوم الحالي</p>
        </CardContent>
      </Card>

      {/* 4. Monthly Revenue */}
      <Card className="rounded-2xl border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-semibold text-slate-500">إيرادات الشهر</CardTitle>
          <div className="h-10 w-10 rounded-xl bg-emerald-50/80 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-800 tracking-tight">
            {monthlyRevenue.toLocaleString()} <span className="text-base font-medium text-slate-400">{currency}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">الإيرادات المحصلة هذا الشهر</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardMetrics(props: DashboardMetricsProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <DashboardMetricsContent {...props} />
    </ErrorBoundary>
  );
}
