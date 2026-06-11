import { MoreHorizontal, Weight, Activity, Heart, Baby } from "lucide-react";

export function PregnancyWidget() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full relative overflow-hidden flex flex-col justify-between">
      
      {/* Background Decor */}
      <div className="absolute left-0 top-0 w-32 h-32 bg-pink-50 rounded-br-full -z-0 opacity-50" />
      <div className="absolute right-0 bottom-0 w-24 h-24 bg-purple-50 rounded-tl-full -z-0 opacity-50" />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <MoreHorizontal className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-800">متابعة الحمل</h3>
          <div className="w-5" /> {/* Spacer */}
        </div>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-24 w-24 bg-pink-100 rounded-full flex items-center justify-center mb-4">
            <Baby className="h-12 w-12 text-pink-500" />
          </div>
          <h4 className="text-xl font-bold text-slate-800 mb-1">زينب محمد علي</h4>
          <p className="text-pink-600 font-bold text-lg mb-4">الأسبوع 28 + 4 أيام</p>
          
          <div className="bg-slate-50 w-full rounded-2xl p-4 text-center mb-2">
            <p className="text-xs text-slate-500 mb-1">موعد الولادة المتوقع</p>
            <p className="text-slate-800 font-bold">20 أغسطس 2024</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full px-4">
            <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden flex">
              <div className="bg-pink-500 h-3 rounded-full" style={{ width: '70%' }}></div>
            </div>
            <p className="text-xs text-slate-500 text-center">تبقى 81 يوم للولادة</p>
          </div>
        </div>
      </div>

      {/* Vitals Footer */}
      <div className="grid grid-cols-4 gap-2 bg-slate-50 rounded-2xl p-3 relative z-10">
        <div className="flex flex-col items-center text-center">
          <Weight className="h-4 w-4 text-slate-400 mb-1" />
          <span className="text-[10px] text-slate-500 mb-0.5">وزن الأم</span>
          <span className="text-sm font-bold text-slate-800">72 كغ</span>
        </div>
        <div className="flex flex-col items-center text-center border-r border-slate-200">
          <Activity className="h-4 w-4 text-pink-400 mb-1" />
          <span className="text-[10px] text-slate-500 mb-0.5">ضغط الدم</span>
          <span className="text-sm font-bold text-slate-800">120/80</span>
        </div>
        <div className="flex flex-col items-center text-center border-r border-slate-200">
          <Heart className="h-4 w-4 text-pink-500 mb-1" />
          <span className="text-[10px] text-slate-500 mb-0.5">نبض الجنين</span>
          <span className="text-sm font-bold text-slate-800">142 نبضة</span>
        </div>
        <div className="flex flex-col items-center text-center border-r border-slate-200">
          <Heart className="h-4 w-4 text-red-400 opacity-50 mb-1" />
          <span className="text-[10px] text-slate-500 mb-0.5">تسجيلين</span>
          <span className="text-sm font-bold text-slate-800">جيدة</span>
        </div>
      </div>
      
    </div>
  );
}
