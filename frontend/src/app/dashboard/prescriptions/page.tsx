"use client";

import { useState, useEffect } from "react";
import { Pill, Plus, Search, Loader2, FileText, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { NewPrescriptionModal } from "@/components/prescriptions/NewPrescriptionModal";

export type PrescriptionItem = {
  id: string;
  medicineName: string;
  dosage: string;
  duration: string;
};

export type Prescription = {
  id: string;
  patientId: string;
  medicalRecordId: string | null;
  notes: string | null;
  createdAt: string;
  patient: {
    fullName: string;
  };
  medicalRecord?: {
    diagnosis: string | null;
  } | null;
  items: PrescriptionItem[];
};

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPrescriptions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Prescription[]>("/prescriptions");
      setPrescriptions(response.data);
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء جلب الوصفات الطبية");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handlePrescriptionCreated = () => {
    setIsModalOpen(false);
    fetchPrescriptions();
  };

  const filteredPrescriptions = prescriptions.filter(p => 
    p.patient?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.items.some(i => i.medicineName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Pill className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">الوصفات الطبية</h1>
            <p className="text-slate-500 mt-1 text-sm">إدارة الوصفات الطبية وإصدار وصفات جديدة للمرضى.</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200 h-11 px-6 text-sm font-medium transition-colors"
        >
          <Plus className="ml-2 h-4 w-4" /> وصفة طبية جديدة
        </Button>
      </div>

      <NewPrescriptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handlePrescriptionCreated} 
      />

      {/* Main Table Card */}
      <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="p-5 border-b border-slate-100 flex items-center bg-white">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input 
                placeholder="البحث باسم المريض أو الدواء..." 
                className="pr-10 bg-slate-50 border-none rounded-xl h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto bg-white">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">المريضة</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4">التشخيص (السبب)</th>
                  <th className="px-6 py-4">الأدوية الموصوفة</th>
                  <th className="px-6 py-4 text-left">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col justify-center items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
                        <span className="text-slate-500">جاري تحميل الوصفات...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPrescriptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                          <FileText className="h-8 w-8 text-indigo-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800">لا توجد وصفات</h3>
                        <p className="text-slate-500 mt-1 max-w-sm">لا توجد وصفات طبية مسجلة. اضغط على الزر أعلاه لإنشاء وصفة جديدة.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPrescriptions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                            {p.patient?.fullName?.charAt(0) || <User className="h-5 w-5" />}
                          </div>
                          <div className="font-semibold text-slate-800">{p.patient?.fullName || 'مجهول'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {new Date(p.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        {p.medicalRecord?.diagnosis ? (
                          <span className="text-slate-700">{p.medicalRecord.diagnosis}</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                            وصفة مباشرة
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {p.items.slice(0, 2).map(item => (
                            <span key={item.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
                              {item.medicineName}
                            </span>
                          ))}
                          {p.items.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                              +{p.items.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <Button variant="outline" size="sm" className="rounded-lg text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                          عرض
                        </Button>
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
