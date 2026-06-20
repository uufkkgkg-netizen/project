"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText, Pill } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function PortalPrescriptions() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/patient-portal/dashboard", {
          });
        setData(res.data);
      } catch (err) {
        toast.error("فشل جلب البيانات");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[500px]"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
  }

  const prescriptions = data?.prescriptions || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <FileText className="h-6 w-6 text-emerald-500" />
        الوصفات الطبية
      </h1>

      {prescriptions.length === 0 ? (
        <div className="text-center p-8 text-slate-500 bg-white rounded-2xl shadow-sm">
          لا توجد وصفات طبية مسجلة لكِ حالياً.
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx: any) => (
            <Card key={rx.id} className="rounded-2xl border border-emerald-100 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-5 flex flex-col md:flex-row gap-5">
                <div className="md:w-1/3 border-b md:border-b-0 md:border-l border-slate-100 pb-4 md:pb-0 md:pl-4">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <Pill className="h-5 w-5" />
                    <h3 className="font-bold text-lg">وصفة طبية</h3>
                  </div>
                  <p className="text-slate-500 text-sm">
                    التاريخ: {new Date(rx.createdAt).toLocaleDateString('ar-IQ')}
                  </p>
                </div>
                <div className="md:w-2/3">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">ملاحظات وتعليمات الاستخدام:</h4>
                  <p className="text-slate-600 bg-emerald-50/50 p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap border border-emerald-50">
                    {rx.notes || "لا توجد ملاحظات إضافية."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
