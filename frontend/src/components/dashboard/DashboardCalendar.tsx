import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, Smartphone } from "lucide-react";

export function DashboardCalendar() {
  const [currentDate] = useState(new Date(2024, 4, 21)); // Mocked to May 21 2024 to match image, or use new Date()

  const upcomingAppts = [
    { time: "09:30 ص", patient: "زينب محمد علي", type: "متابعة حمل - الأسبوع 28", img: "bg-pink-100" },
    { time: "10:15 ص", patient: "فاطمة حسن", type: "دورة شهرية - ألم شديد", img: "bg-purple-100" },
    { time: "11:00 ص", patient: "نور الهدى كريم", type: "نتيجة تحاليل", img: "bg-emerald-100" },
    { time: "12:00 م", patient: "سارة جاسم محمد", type: "سونار متابعة", img: "bg-blue-100" },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      
      {/* Calendar Widget */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">التقويم</h3>
        
        {/* Simple Mock Calendar UI to match image perfectly since react-day-picker might be unstyled */}
        <div className="flex justify-between items-center mb-4 px-2 text-slate-800 font-bold text-sm">
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span>مايو 2024</span>
          <ChevronLeft className="h-4 w-4 text-slate-400" />
        </div>
        
        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-2">
          <div>س</div><div>ح</div><div>ن</div><div>ث</div><div>ر</div><div>خ</div><div>ج</div>
        </div>
        
        <div className="grid grid-cols-7 text-center text-sm gap-y-2 text-slate-700 font-medium">
          <div className="text-slate-300">28</div><div className="text-slate-300">29</div><div className="text-slate-300">30</div><div>1</div><div>2</div><div>3</div><div>4</div>
          <div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>10</div><div>11</div>
          <div>12</div><div>13</div><div>14</div><div>15</div><div>16</div><div>17</div><div>18</div>
          <div>19</div><div>20</div><div className="bg-violet-600 text-white rounded-full w-7 h-7 flex items-center justify-center mx-auto shadow-md">21</div><div>22</div><div>23</div><div>24</div><div>25</div>
          <div>26</div><div>27</div><div>28</div><div>29</div><div>30</div><div>31</div><div className="text-slate-300">1</div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex-1">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">المواعيد القادمة</h3>
          <span className="text-xs font-bold text-violet-600 cursor-pointer">عرض الكل</span>
        </div>

        <div className="space-y-4">
          {upcomingAppts.map((appt, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 w-12 text-right">{appt.time}</span>
              <div className={`w-1 h-10 rounded-full ${idx % 2 === 0 ? 'bg-pink-400' : 'bg-violet-400'}`} />
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{appt.patient}</p>
                <p className="text-xs text-slate-500">{appt.type}</p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-slate-600 ${appt.img}`}>
                {appt.patient.charAt(0)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Card */}
      <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 w-2/3">
          <h3 className="text-lg font-bold mb-2">تطبيق المريضة</h3>
          <p className="text-xs text-violet-100 mb-4 leading-relaxed">يمكن لمريضاتك متابعة حملهن وتحاليلهن من التطبيق</p>
          <button className="bg-white text-violet-700 text-xs font-bold py-2 px-4 rounded-xl shadow-sm hover:bg-slate-50">
            تحميل التطبيق
          </button>
        </div>
        <div className="absolute -left-6 -bottom-6 w-32 opacity-80 pointer-events-none transform rotate-12">
          <Smartphone className="w-full h-full text-white" />
        </div>
      </div>

    </div>
  );
}
