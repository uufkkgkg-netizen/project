import { FileText, Image as ImageIcon, PieChart as PieChartIcon, Pill } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function RecentGrids({ ultrasounds, prescriptions }: { ultrasounds: any[], prescriptions: any[] }) {
  // Mock Labs since we don't have a Lab module yet
  const recentLabs = [
    { patient: "زينب محمد", type: "CBC", date: "20/05/2024" },
    { patient: "فاطمة حسن", type: "هرمونات", date: "19/05/2024" },
    { patient: "نور الهدى", type: "سكر صائم", date: "18/05/2024" },
  ];

  // Pie chart data
  const pieData = [
    { name: "حمل", value: 40, color: "#06b6d4" },       // cyan
    { name: "دورة شهرية", value: 25, color: "#8b5cf6" },// violet
    { name: "تكيس مبايض", value: 15, color: "#f59e0b" },// amber
    { name: "التهابات", value: 10, color: "#10b981" },  // emerald
    { name: "عقم", value: 10, color: "#ec4899" },       // pink
  ];

  // Safe slice arrays
  const recentUltrasounds = ultrasounds?.slice(0, 3) || [];
  const recentPrescriptions = prescriptions?.slice(0, 3) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      
      {/* 1. Recent Labs */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800">التحاليل الأخيرة</h3>
          <span className="text-[10px] font-bold text-violet-600 cursor-pointer">عرض الكل</span>
        </div>
        <div className="flex-1 flex flex-col gap-3">
          {recentLabs.map((lab, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-xs font-black">
                PDF
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{lab.patient} - <span className="text-slate-500 font-normal">{lab.type}</span></p>
                <p className="text-[10px] text-slate-400 mt-0.5">{lab.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Recent Ultrasounds */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800">السونار الأخير</h3>
          <span className="text-[10px] font-bold text-violet-600 cursor-pointer">عرض الكل</span>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          {recentUltrasounds.length > 0 ? (
            <div className="relative w-full h-32 bg-slate-900 rounded-xl overflow-hidden group">
              {/* Main Image View */}
              {recentUltrasounds[0].imageUrls?.[0] ? (
                 <img src={recentUltrasounds[0].imageUrls[0]} alt="Sonar" className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
              {/* Thumbnails row overlaid at bottom */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                {recentUltrasounds.slice(0,4).map((u, i) => (
                  <div key={i} className="w-8 h-8 bg-slate-800 border-2 border-white rounded-md overflow-hidden opacity-90 hover:opacity-100 cursor-pointer">
                    {u.imageUrls?.[0] && <img src={u.imageUrls[0]} className="w-full h-full object-cover" />}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
              لا توجد صور حديثة
            </div>
          )}
        </div>
      </div>

      {/* 3. Case Distribution */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col h-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-slate-800">توزيع الحالات</h3>
        </div>
        <div className="flex-1 flex items-center justify-center relative -ml-4">
          <div className="w-full h-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'النسبة']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
            {pieData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                <span className="text-slate-400 w-6 text-right">{entry.value}%</span>
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Recent Prescriptions */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800">الوصفات الطبية الأخيرة</h3>
          <span className="text-[10px] font-bold text-violet-600 cursor-pointer">عرض الكل</span>
        </div>
        <div className="flex-1 flex flex-col gap-3">
          {recentPrescriptions.length > 0 ? recentPrescriptions.map((rx, i) => {
            const dateStr = new Date(rx.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <span className="text-[10px] font-bold text-slate-400 w-12 text-right">{dateStr}</span>
                <div className="flex-1 border-r-2 border-slate-100 pr-3">
                  <p className="text-xs font-bold text-slate-800">{rx.patient?.fullName || "مريضة"}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[100px]">{rx.diagnosis || "وصفة مباشرة"}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center shrink-0">
                  <Pill className="h-3 w-3" />
                </div>
              </div>
            );
          }) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">لا توجد وصفات</div>
          )}
        </div>
      </div>

    </div>
  );
}
