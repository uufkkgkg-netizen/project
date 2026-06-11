import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MenstrualCycleWidget() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full flex flex-col items-center justify-between">
      
      <div className="flex justify-between items-center w-full mb-4">
        <MoreHorizontal className="h-5 w-5 text-slate-400" />
        <h3 className="text-lg font-bold text-slate-800">الدورة الشهرية</h3>
        <div className="w-5" /> {/* Spacer */}
      </div>

      {/* Radial Calendar Mock */}
      <div className="relative w-40 h-40 flex items-center justify-center my-4">
        {/* SVG Circle for progress */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <circle 
            cx="50" cy="50" r="45" fill="none" 
            stroke="url(#gradient)" strokeWidth="8" 
            strokeDasharray="282.7" strokeDashoffset="56.5" 
            strokeLinecap="round" 
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" /> {/* pink-500 */}
              <stop offset="100%" stopColor="#8b5cf6" /> {/* violet-500 */}
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black text-slate-800">5</span>
          <span className="text-xs text-slate-500 font-bold">أيام متبقية</span>
        </div>
      </div>

      <div className="text-center w-full">
        <p className="text-xs text-slate-500 mb-1">موعد الدورة القادمة</p>
        <p className="text-slate-800 font-bold mb-6">26 مايو 2024</p>
        
        <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 shadow-md shadow-violet-200">
          <Plus className="mr-2 h-4 w-4" /> تسجيل دورة جديدة
        </Button>
      </div>

    </div>
  );
}
