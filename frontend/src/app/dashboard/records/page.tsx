"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Stethoscope, Search, Loader2, FileText, User, Calendar,
  HeartPulse, AlertCircle, ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";

type Visit = {
  id: string;
  visitDate: string;
  chiefComplaint: string;
  diagnosis: string | null;
  treatment: string | null;
  vitals: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    weight?: string;
  } | null;
  notes: string | null;
  patient: {
    id: string;
    fullName: string;
    fileNumber: number;
    phone: string | null;
  };
  doctor: {
    firstName: string;
    lastName: string;
  } | null;
};

export default function MedicalRecordsPage() {
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (searchQuery) params.search = searchQuery;
      const res = await api.get("/patients/visits/all", { params });
      setVisits(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      toast.error("فشل تحميل السجلات الطبية", {
        description: err.response?.data?.message || "تحقق من اتصال الخادم"
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => fetchRecords(), searchQuery ? 500 : 0);
    return () => clearTimeout(timer);
  }, [fetchRecords, searchQuery]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 pb-8" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-rose-50 to-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-200">
            <Stethoscope className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">السجلات الطبية المركزية</h1>
            <p className="text-slate-500 text-sm mt-1">
              جميع الزيارات والسجلات الطبية — إجمالي <span className="font-bold text-indigo-600">{total}</span> سجل
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            placeholder="البحث باسم المريضة..."
            className="pr-10 bg-white border-slate-200 rounded-xl h-11"
            value={searchQuery}
            onChange={(e) => {
              setPage(1);
              setSearchQuery(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Table Card */}
      <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto bg-white">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4">المريضة</th>
                  <th className="px-5 py-4">تاريخ الزيارة</th>
                  <th className="px-5 py-4">الشكوى الرئيسية</th>
                  <th className="px-5 py-4">التشخيص</th>
                  <th className="px-5 py-4">العلامات الحيوية</th>
                  <th className="px-5 py-4">الطبيب</th>
                  <th className="px-5 py-4 text-left">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                        <span className="text-slate-400 font-medium">جاري تحميل السجلات...</span>
                      </div>
                    </td>
                  </tr>
                ) : visits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center">
                          <FileText className="h-8 w-8 text-indigo-300" />
                        </div>
                        <h3 className="font-bold text-slate-600">لا توجد سجلات</h3>
                        <p className="text-slate-400 text-xs max-w-xs">
                          {searchQuery ? "لا توجد نتائج مطابقة لبحثك." : "لم يتم تسجيل أي زيارة طبية حتى الآن."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visits.map((visit) => (
                    <tr
                      key={visit.id}
                      className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/dashboard/patients/${visit.patient.id}`)}
                    >
                      {/* Patient */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {visit.patient.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{visit.patient.fullName}</div>
                            <div className="text-xs text-slate-400">ملف #{visit.patient.fileNumber}</div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {new Date(visit.visitDate).toLocaleDateString("ar-IQ", {
                            year: "numeric", month: "short", day: "numeric"
                          })}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(visit.visitDate).toLocaleTimeString("ar-IQ", {
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </div>
                      </td>

                      {/* Chief Complaint */}
                      <td className="px-5 py-4 max-w-[200px]">
                        <p className="text-slate-700 line-clamp-2">{visit.chiefComplaint}</p>
                      </td>

                      {/* Diagnosis */}
                      <td className="px-5 py-4">
                        {visit.diagnosis ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {visit.diagnosis}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Vitals */}
                      <td className="px-5 py-4">
                        {visit.vitals && Object.values(visit.vitals).some(v => v) ? (
                          <div className="flex flex-col gap-1">
                            {visit.vitals.bloodPressure && (
                              <span className="flex items-center gap-1 text-xs text-rose-600">
                                <HeartPulse className="h-3 w-3" />
                                {visit.vitals.bloodPressure}
                              </span>
                            )}
                            {visit.vitals.weight && (
                              <span className="text-xs text-slate-500">{visit.vitals.weight} kg</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Doctor */}
                      <td className="px-5 py-4">
                        {visit.doctor ? (
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs font-medium text-slate-600">
                              د. {visit.doctor.firstName} {visit.doctor.lastName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-600 hover:bg-indigo-50 rounded-lg h-8 px-3 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          عرض الملف
                          <ChevronRight className="h-3.5 w-3.5 mr-1" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <span className="text-sm text-slate-500">
                صفحة {page} من {totalPages} — إجمالي {total} سجل
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
