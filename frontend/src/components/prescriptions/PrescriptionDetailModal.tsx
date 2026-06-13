"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Loader2, Printer, CheckCircle2, Pill, QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";

type Props = { prescriptionId: string; isOpen: boolean; onClose: () => void };

export function PrescriptionDetailModal({ prescriptionId, isOpen, onClose }: Props) {
  const [prescription, setPrescription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && prescriptionId) {
      fetchPrescription();
    }
  }, [isOpen, prescriptionId]);

  const fetchPrescription = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/prescriptions/${prescriptionId}`);
      setPrescription(res.data);
    } catch {
      toast.error("فشل جلب تفاصيل الوصفة الطبية");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Build the QR code data string. We encode some basic validation data.
  const qrData = prescription ? JSON.stringify({
    id: prescription.id,
    patient: prescription.patient?.fullName,
    date: prescription.createdAt,
    items: prescription.items?.map((i: any) => i.medicineName),
  }) : "";

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[750px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-800 flex items-center justify-between">
            <span>تفاصيل الوصفة الطبية (E-Prescription)</span>
            <Button variant="outline" size="sm" onClick={handlePrint} className="rounded-xl gap-2 print:hidden">
              <Printer className="h-4 w-4" /> طباعة الوصفة
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
        ) : prescription ? (
          <>
            {/* ─── PRINTABLE PRESCRIPTION ─────────────────────────────────────── */}
            <div ref={printRef} id="printable-receipt" className="space-y-6 bg-white p-2">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-rose-100 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-rose-700 tracking-tight">FemCare Clinic</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">وصفة طبية إلكترونية معتمدة</p>
                  {prescription.doctor && (
                    <p className="text-xs text-slate-400 mt-2">د. {prescription.doctor.firstName} {prescription.doctor.lastName}</p>
                  )}
                </div>
                
                {/* QR Code Container */}
                <div className="flex flex-col items-center gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <QRCodeSVG value={qrData} size={80} level="M" fgColor="#4f46e5" />
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <QrCode className="h-3 w-3" /> E-Rx Verified
                  </span>
                </div>
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-rose-50/50 p-4 rounded-2xl border border-rose-50">
                <div>
                  <p className="text-xs text-rose-400 mb-1 font-semibold">المريض/ة</p>
                  <p className="font-bold text-slate-800">{prescription.patient?.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-rose-400 mb-1 font-semibold">رقم الملف</p>
                  <p className="font-bold text-slate-800">#{prescription.patient?.fileNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-rose-400 mb-1 font-semibold">التاريخ</p>
                  <p className="font-bold text-slate-800">
                    {format(new Date(prescription.createdAt), "d MMMM yyyy", { locale: ar })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-rose-400 mb-1 font-semibold">رقم الوصفة</p>
                  <p className="font-mono text-sm text-slate-600">{prescription.id.split('-')[0].toUpperCase()}</p>
                </div>
              </div>

              {/* Rx Symbol */}
              <div className="pt-2">
                <span className="text-5xl font-serif font-black text-rose-200 italic select-none">Rx</span>
              </div>

              {/* Medications List */}
              <div className="space-y-4 min-h-[250px]">
                {prescription.items?.map((item: any, i: number) => (
                  <div key={i} className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-0">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0 mt-1">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 english-font" dir="ltr">{item.medicineName}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">
                          الجرعة: {item.dosage}
                        </span>
                        <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-medium border border-amber-100">
                          لمدة: {item.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {prescription.notes && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-6">
                  <p className="text-xs font-bold text-slate-500 mb-2">تعليمات وملاحظات الطبيب:</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{prescription.notes}</p>
                </div>
              )}

              {/* Footer / Signature Line */}
              <div className="pt-16 pb-8 flex justify-between items-end">
                <div className="text-xs text-slate-400">
                  <p>تم الإصدار إلكترونياً ولا يحتاج إلى ختم مادي.</p>
                  <p className="mt-1 font-mono text-[10px]">{prescription.id}</p>
                </div>
                <div className="text-center w-48 border-t border-slate-300 pt-2">
                  <p className="text-sm font-bold text-slate-800">توقيع الطبيب المعالج</p>
                </div>
              </div>

            </div>

          </>
        ) : (
          <div className="text-center p-10 text-slate-500">لا توجد بيانات</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
