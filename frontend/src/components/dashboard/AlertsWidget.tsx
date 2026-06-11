import { Bell, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AlertsWidget() {
  const alerts = [
    {
      patient: "زينب محمد",
      text: "موعد سونار بعد 3 أيام",
      time: "منذ 10 دقائق",
      icon: <Bell className="h-4 w-4 text-pink-500" />,
      bg: "bg-pink-100",
    },
    {
      patient: "فاطمة حسن",
      text: "تحليل دم مطلوب",
      time: "منذ ساعة",
      icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
      bg: "bg-amber-100",
    },
    {
      patient: "نور الهدى",
      text: "موعد متابعة حمل غداً",
      time: "منذ 2 ساعة",
      icon: <Bell className="h-4 w-4 text-pink-500" />,
      bg: "bg-pink-100",
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-bold text-slate-800">تنبيهات مهمة</h3>
        <Bell className="h-5 w-5 text-slate-400" />
      </div>

      <div className="flex-1 space-y-4">
        {alerts.map((alert, idx) => (
          <div key={idx} className="flex gap-3 items-start border-b border-slate-50 pb-4 last:border-0">
            <div className={`p-2 rounded-full mt-1 shrink-0 ${alert.bg}`}>
              {alert.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {alert.patient}: <span className="font-normal text-slate-600">{alert.text}</span>
              </p>
              <span className="text-xs text-slate-400 mt-1 block">{alert.time}</span>
            </div>
          </div>
        ))}
      </div>

      <Button variant="ghost" className="w-full mt-4 text-fuchsia-600 font-bold hover:bg-fuchsia-50 hover:text-fuchsia-700">
        عرض جميع التنبيهات
      </Button>
    </div>
  );
}
