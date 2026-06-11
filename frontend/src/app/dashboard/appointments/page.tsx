"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, Clock, Plus, Loader2, PlayCircle, CheckCircle2, XCircle, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";
import { NewAppointmentModal } from "@/components/appointments/NewAppointmentModal";

// Assuming UserRole is passed in AuthContext, we can mock it here for UI or use local storage logic
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "قيد الانتظار", color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertCircle },
  CONFIRMED: { label: "مؤكد", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle2 },
  IN_PROGRESS: { label: "قيد المعاينة", color: "bg-violet-100 text-violet-700 border-violet-200", icon: PlayCircle },
  COMPLETED: { label: "مكتمل", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  CANCELLED: { label: "ملغى", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data);
    } catch {
      toast.error("فشل جلب قائمة المواعيد");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await api.patch(`/appointments/${id}`, { status: newStatus });
      toast.success("تم تحديث حالة الموعد");
      fetchAppointments();
    } catch (err: any) {
      toast.error("فشل تحديث الحالة", {
        description: err.response?.data?.message || "لا تملك الصلاحية لتغيير الحالة."
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-violet-100 text-violet-600 rounded-xl">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">إدارة المواعيد</h1>
            <p className="text-slate-500 mt-1 text-sm">جدولة مرئية ومتابعة حالات المرضى</p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-violet-600 hover:bg-violet-700 rounded-xl px-6 h-11">
          <Plus className="ml-2 h-4 w-4" /> حجز موعد جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
        ) : appointments.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">لا توجد مواعيد مبرمجة حالياً.</p>
          </div>
        ) : (
          appointments.map((appointment) => {
            const config = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.PENDING;
            const Icon = config.icon;
            
            return (
              <Card key={appointment.id} className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  
                  {/* Info */}
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-slate-600">
                      <Clock className="h-5 w-5 mb-1 text-violet-500" />
                      <span className="text-[10px] font-bold">
                        {format(new Date(appointment.appointmentDate), "hh:mm a", { locale: ar })}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">
                        {appointment.patient.fullName} <span className="text-sm font-normal text-slate-400 mx-2">ملف #{appointment.patient.fileNumber}</span>
                      </h3>
                      <div className="text-sm text-slate-500 flex items-center gap-3 mt-1">
                        <span>د. {appointment.doctor.firstName} {appointment.doctor.lastName}</span>
                        <span>•</span>
                        <span>{format(new Date(appointment.appointmentDate), "EEEE, d MMMM yyyy", { locale: ar })}</span>
                        <span>•</span>
                        <span>{appointment.durationMinutes} دقيقة</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border ${config.color}`}>
                      <Icon className="h-3.5 w-3.5" /> {config.label}
                    </span>

                    {/* Quick Actions based on status */}
                    <div className="flex items-center gap-2 mr-auto md:mr-4">
                      {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-9 px-3 rounded-lg border-violet-200 text-violet-700 hover:bg-violet-50"
                          onClick={() => handleStatusChange(appointment.id, 'IN_PROGRESS')}
                          disabled={updatingId === appointment.id}
                        >
                          {updatingId === appointment.id ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <PlayCircle className="h-4 w-4 ml-1" />}
                          بدء المعاينة
                        </Button>
                      )}
                      
                      {appointment.status === 'IN_PROGRESS' && (
                        <Button 
                          size="sm" 
                          className="h-9 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleStatusChange(appointment.id, 'COMPLETED')}
                          disabled={updatingId === appointment.id}
                        >
                          {updatingId === appointment.id ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <CheckCircle2 className="h-4 w-4 ml-1" />}
                          إنهاء الموعد
                        </Button>
                      )}

                      {appointment.status === 'PENDING' && (
                         <Button 
                         size="sm" 
                         variant="ghost" 
                         className="h-9 px-2 rounded-lg text-red-500 hover:bg-red-50"
                         onClick={() => handleStatusChange(appointment.id, 'CANCELLED')}
                         disabled={updatingId === appointment.id}
                       >
                         إلغاء
                       </Button>
                      )}
                    </div>
                  </div>

                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <NewAppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchAppointments} 
      />
    </div>
  );
}
