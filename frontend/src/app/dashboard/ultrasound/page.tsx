"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Search, Calendar, FileText, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

type Report = {
  id: string;
  patientId: string;
  patient: { fullName: string; fileNumber: number };
  doctor: { firstName: string; lastName: string } | null;
  date: string;
  status: string;
};

export default function UltrasoundDashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("/ultrasound");
      setReports(res.data);
    } catch (error) {
      console.error("Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter(r => 
    r.patient.fullName.includes(searchTerm) || 
    r.patient.fileNumber.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full -z-0 opacity-50"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
            <Activity className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">سجل تقارير السونار</h1>
            <p className="text-slate-500 font-medium mt-2">عرض وإدارة كافة التقارير السريرية المعتمدة في العيادة</p>
          </div>
        </div>
      </div>

      <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-xl text-slate-800 font-bold">التقارير السابقة</CardTitle>
            <div className="relative max-w-sm w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="ابحث برقم الملف أو اسم المريضة..."
                className="pl-4 pr-11 h-12 rounded-xl bg-white border-slate-200 focus-visible:ring-indigo-500 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">جاري التحميل...</div>
          ) : filteredReports.length === 0 ? (
            <div className="p-16 text-center">
              <FileText className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">لا توجد تقارير سونار مسجلة حالياً.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-5 whitespace-nowrap">رقم الملف</th>
                    <th className="px-6 py-5 whitespace-nowrap">اسم المريضة</th>
                    <th className="px-6 py-5 whitespace-nowrap">التاريخ</th>
                    <th className="px-6 py-5 whitespace-nowrap">الطبيب المعالج</th>
                    <th className="px-6 py-5 whitespace-nowrap">الحالة</th>
                    <th className="px-6 py-5 whitespace-nowrap">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-700">#{report.patient.fileNumber}</td>
                      <td className="px-6 py-4 font-bold text-indigo-900">{report.patient.fullName}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {new Date(report.date).toLocaleDateString('ar-IQ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {report.doctor ? `د. ${report.doctor.firstName} ${report.doctor.lastName}` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                          {report.status === 'FINALIZED' ? 'معتمد' : 'مسودة'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => router.push(`/dashboard/patients/${report.patientId}`)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm hover:underline"
                        >
                          عرض الملف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
