"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function PortalAppointments() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/patient-portal/dashboard", {
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

  const allAppointments = [
    ...(data?.upcomingAppointments || []),
    ...(data?.pastAppointments || [])
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Calendar className="h-6 w-6 text-rose-500" />
        مواعيدي
      </h1>

      {allAppointments.length === 0 ? (
        <div className="text-center p-8 text-slate-500 bg-white rounded-2xl shadow-sm">
          لا توجد مواعيد مسجلة لكِ حالياً.
        </div>
      ) : (
        <div className="space-y-4">
          {allAppointments.map((app: any) => {
            const isUpcoming = new Date(app.appointmentDate) >= new Date();
            return (
              <Card key={app.id} className={`rounded-2xl border ${isUpcoming ? 'border-rose-100 bg-rose-50/30' : 'border-slate-100 bg-white'} shadow-sm overflow-hidden`}>
                <CardContent className="p-0 flex items-stretch">
                  <div className={`w-24 flex flex-col items-center justify-center py-4 ${isUpcoming ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <span className="text-sm opacity-90">{new Date(app.appointmentDate).toLocaleDateString('ar-IQ', { weekday: 'short' })}</span>
                    <span className="text-2xl font-bold">{new Date(app.appointmentDate).getDate()}</span>
                    <span className="text-sm opacity-90">{new Date(app.appointmentDate).toLocaleDateString('ar-IQ', { month: 'short' })}</span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-lg">موعد مراجعة</h3>
                      {isUpcoming ? (
                        <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-md">قادم</span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">مكتمل</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                      الطبيبة: د. {app.doctor?.firstName} {app.doctor?.lastName}
                    </p>
                    <div className="mt-3 inline-block bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 w-fit">
                      الساعة: {new Date(app.appointmentDate).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
