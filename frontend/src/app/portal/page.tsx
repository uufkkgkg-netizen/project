"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, FileText, Activity } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function PortalDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("portal_access_token");
        const res = await api.get("/patient-portal/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        toast.error("فشل جلب البيانات");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[500px]"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
  }

  const upcomingCount = data?.upcomingAppointments?.length || 0;
  const reportsCount = data?.ultrasounds?.length || 0;
  const prescriptionsCount = data?.prescriptions?.length || 0;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-rose-500 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-rose-200">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">أهلاً بكِ في بوابتك الصحية</h1>
        <p className="text-rose-100 opacity-90 max-w-lg leading-relaxed">
          نحن هنا لرعايتك. يمكنك تصفح مواعيدك القادمة، تحميل صور السونار، ومراجعة الأدوية المصروفة لك بكل سهولة.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <Card className="rounded-2xl border-none shadow-sm bg-white text-center py-4">
          <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{upcomingCount}</div>
          <div className="text-xs md:text-sm font-medium text-slate-500 mt-1">مواعيد قادمة</div>
        </Card>
        
        <Card className="rounded-2xl border-none shadow-sm bg-white text-center py-4">
          <div className="mx-auto w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-3">
            <Activity className="h-6 w-6" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{reportsCount}</div>
          <div className="text-xs md:text-sm font-medium text-slate-500 mt-1">تقارير سونار</div>
        </Card>
        
        <Card className="rounded-2xl border-none shadow-sm bg-white text-center py-4">
          <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3">
            <FileText className="h-6 w-6" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{prescriptionsCount}</div>
          <div className="text-xs md:text-sm font-medium text-slate-500 mt-1">وصفات طبية</div>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      {upcomingCount > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-rose-500" /> موعدك القادم
          </h2>
          <div className="space-y-3">
            {data.upcomingAppointments.map((app: any) => (
              <Card key={app.id} className="rounded-2xl border border-rose-100 shadow-sm bg-rose-50/30 overflow-hidden">
                <CardContent className="p-0 flex items-stretch">
                  <div className="w-24 bg-rose-500 text-white flex flex-col items-center justify-center py-4">
                    <span className="text-sm opacity-90">{new Date(app.appointmentDate).toLocaleDateString('ar-IQ', { weekday: 'short' })}</span>
                    <span className="text-2xl font-bold">{new Date(app.appointmentDate).getDate()}</span>
                    <span className="text-sm opacity-90">{new Date(app.appointmentDate).toLocaleDateString('ar-IQ', { month: 'short' })}</span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-slate-800 text-lg">موعد مراجعة</h3>
                    <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                      الطبيبة: د. {app.doctor?.firstName} {app.doctor?.lastName}
                    </p>
                    <div className="mt-3 inline-block bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 w-fit">
                      الساعة: {new Date(app.appointmentDate).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
