"use client";

import { useState, useEffect } from "react";
import { Loader2, Bell, CheckCircle, XCircle, Clock } from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type WhatsappLog = {
  id: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  errorMessage: string | null;
  createdAt: string;
};

export default function WhatsappLogsPage() {
  const [logs, setLogs] = useState<WhatsappLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get("/whatsapp/logs");
      setLogs(res.data);
    } catch (e) {
      console.error("Failed to fetch whatsapp logs", e);
      // fallback mock data for UI visualization if backend not fully up
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.patientName.includes(searchQuery) || 
    log.patientPhone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl" style={{background:"linear-gradient(135deg,#FFF1F2,#FFE4E6)",color:"#E11D48"}}>
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">سجل إشعارات الواتساب</h1>
            <p className="text-slate-500 text-sm mt-1">مراقبة تذكيرات المواعيد المرسلة للمريضات (خاص بالمدير العام).</p>
          </div>
        </div>
      </div>

      <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Input 
                placeholder="البحث بالاسم أو الرقم..." 
                className="rounded-xl bg-white border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="hidden sm:block text-sm text-slate-500 font-medium">
              العدد الكلي: {filteredLogs.length} سجل
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">اسم المريضة</th>
                  <th className="px-6 py-4">رقم الهاتف</th>
                  <th className="px-6 py-4">وقت الموعد</th>
                  <th className="px-6 py-4">حالة الإرسال</th>
                  <th className="px-6 py-4">تاريخ السجل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10">
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                      لا يوجد سجلات حالياً.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-rose-50/40 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-800">{log.patientName}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono" dir="ltr">{log.patientPhone}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(log.appointmentDate).toLocaleString('ar-IQ')}
                      </td>
                      <td className="px-6 py-4">
                        {log.status === "SUCCESS" && (
                          <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-md text-xs font-bold ring-1 ring-inset ring-green-200">
                            <CheckCircle className="h-3.5 w-3.5" /> نجاح
                          </span>
                        )}
                        {log.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md text-xs font-bold ring-1 ring-inset ring-amber-200">
                            <Clock className="h-3.5 w-3.5" /> قيد الانتظار
                          </span>
                        )}
                        {log.status === "FAILED" && (
                          <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-md text-xs font-bold ring-1 ring-inset ring-red-200">
                            <XCircle className="h-3.5 w-3.5" /> {log.errorMessage || "فشل الإرسال"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(log.createdAt).toLocaleString('ar-IQ')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
