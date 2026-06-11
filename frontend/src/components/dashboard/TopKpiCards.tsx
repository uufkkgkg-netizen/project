import { Users, Baby, CalendarCheck, ActivitySquare, DollarSign } from "lucide-react";

export function TopKpiCards({ analytics, billing }: { analytics: any, billing: any }) {
  const cards = [
    {
      title: "إجمالي المراجعات",
      value: analytics?.totalPatients || 0,
      subtext: "+12 اليوم",
      icon: <Users className="h-6 w-6 text-pink-600" />,
      bgIcon: "bg-pink-100",
      textSub: "text-emerald-500",
    },
    {
      title: "الحوامل",
      value: "128", // Mocked as requested
      subtext: "+8 اليوم",
      icon: <Baby className="h-6 w-6 text-purple-600" />,
      bgIcon: "bg-purple-100",
      textSub: "text-emerald-500",
    },
    {
      title: "المواعيد اليوم",
      value: analytics?.appointmentsToday || 0,
      subtext: "5 مكتملة",
      icon: <CalendarCheck className="h-6 w-6 text-emerald-600" />,
      bgIcon: "bg-emerald-100",
      textSub: "text-emerald-500",
    },
    {
      title: "الولادات هذا الشهر",
      value: "16", // Mocked as requested
      subtext: "+3 عن الشهر الماضي",
      icon: <ActivitySquare className="h-6 w-6 text-blue-600" />,
      bgIcon: "bg-blue-100",
      textSub: "text-emerald-500",
    },
    {
      title: "الإيرادات الشهرية",
      value: (billing?.totalRevenue || 0).toLocaleString(),
      subtext: "دينار عراقي",
      icon: <DollarSign className="h-6 w-6 text-amber-600" />,
      bgIcon: "bg-amber-100",
      textSub: "text-slate-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between items-center text-center">
          <h3 className="text-slate-600 font-bold text-sm mb-3">{card.title}</h3>
          
          <div className="flex flex-col items-center gap-2 mb-2">
            <span className="text-3xl font-black text-slate-800">{card.value}</span>
            <div className={`p-3 rounded-2xl ${card.bgIcon}`}>
              {card.icon}
            </div>
          </div>
          
          <p className={`text-xs font-semibold ${card.textSub}`}>{card.subtext}</p>
        </div>
      ))}
    </div>
  );
}
