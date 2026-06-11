import { Calendar, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type AppointmentItem = {
  id: string;
  date: string;
  time: string;
  status: string;
  patient: {
    fullName: string;
  };
};

type UpcomingAppointmentsWidgetProps = {
  appointments: AppointmentItem[];
};

export function UpcomingAppointmentsWidget({ appointments }: UpcomingAppointmentsWidgetProps) {
  // Sort and filter logically handled by parent, we just display
  const displayAppointments = appointments.slice(0, 5);

  return (
    <Card className="rounded-2xl border-slate-100 shadow-sm flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          المواعيد القادمة
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {displayAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">لا توجد مواعيد مجدولة قادمة.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                    {apt.patient?.fullName?.charAt(0) || <User className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{apt.patient?.fullName || "مجهول"}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500 font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span dir="ltr">{apt.time}</span>
                    </div>
                  </div>
                </div>
                
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/10">
                  اليوم
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
