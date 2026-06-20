"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Activity, ImageIcon, Download } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function PortalRecords() {
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

  const ultrasounds = data?.ultrasounds || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Activity className="h-6 w-6 text-purple-500" />
        تقارير السونار
      </h1>

      {ultrasounds.length === 0 ? (
        <div className="text-center p-8 text-slate-500 bg-white rounded-2xl shadow-sm">
          لا توجد تقارير سونار مسجلة لكِ حالياً.
        </div>
      ) : (
        <div className="space-y-4">
          {ultrasounds.map((report: any) => (
            <Card key={report.id} className="rounded-2xl border border-slate-100 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">فحص سونار</h3>
                    <p className="text-slate-500 text-sm mt-1">
                      {new Date(report.date).toLocaleDateString('ar-IQ')}
                    </p>
                  </div>
                  <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                    مكتمل
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">النتائج الطبية:</h4>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap">
                    {report.findings}
                  </p>
                </div>

                {report.imageUrls && report.imageUrls.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" /> الصور المرفقة:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                      {report.imageUrls.map((url: string, index: number) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-square">
                          <img src={url} alt="سونار" className="w-full h-full object-cover" />
                          <a 
                            href={url} 
                            download 
                            target="_blank"
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Download className="h-6 w-6 text-white" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
