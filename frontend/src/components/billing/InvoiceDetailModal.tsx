"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Loader2, Printer, CreditCard, CheckCircle2, Clock, AlertCircle,
  XCircle, Banknote, Building2, Wifi,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  UNPAID:        { label: "غير مدفوع",    color: "text-red-600 bg-red-50",       icon: AlertCircle },
  PARTIALLY_PAID:{ label: "مدفوع جزئياً", color: "text-amber-600 bg-amber-50",   icon: Clock },
  PAID:          { label: "مدفوع بالكامل", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle2 },
  CANCELLED:     { label: "ملغى",          color: "text-slate-500 bg-slate-50",   icon: XCircle },
};

const METHOD_OPTIONS = [
  { value: "CASH",          label: "نقداً",         icon: Banknote },
  { value: "BANK_TRANSFER", label: "تحويل بنكي",    icon: Building2 },
  { value: "LOCAL_NETWORK", label: "شبكة محلية",    icon: Wifi },
];

type Props = { invoiceId: string; isOpen: boolean; onClose: () => void; onSuccess: () => void };

export function InvoiceDetailModal({ invoiceId, isOpen, onClose, onSuccess }: Props) {
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [isPaying, setIsPaying] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchInvoice = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/billing/${invoiceId}`);
      setInvoice(res.data);
    } catch {
      toast.error("فشل جلب تفاصيل الفاتورة");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (isOpen && invoiceId) fetchInvoice(); }, [isOpen, invoiceId]);

  const totalPaid = invoice?.payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) ?? 0;
  const remaining = invoice ? Number(invoice.finalAmount) - totalPaid : 0;

  const handlePayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) {
      toast.error("أدخل مبلغاً صحيحاً"); return;
    }
    setIsPaying(true);
    try {
      await api.post(`/billing/${invoiceId}/payments`, {
        amount: Number(payAmount),
        paymentMethod: payMethod,
      });
      toast.success("تم تسجيل الدفعة بنجاح");
      setPayAmount("");
      fetchInvoice();
      onSuccess();
    } catch (err: any) {
      toast.error("فشل تسجيل الدفعة", { description: err.response?.data?.message });
    } finally {
      setIsPaying(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const cfg = invoice ? (STATUS_LABELS[invoice.status] ?? STATUS_LABELS.UNPAID) : null;
  const StatusIcon = cfg?.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[680px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-800 flex items-center justify-between">
            <span>تفاصيل الفاتورة</span>
            <Button variant="outline" size="sm" onClick={handlePrint} className="rounded-xl gap-2 print:hidden">
              <Printer className="h-4 w-4" /> طباعة الإيصال
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
        ) : invoice ? (
          <>
            {/* ─── PRINTABLE RECEIPT ─────────────────────────────────────── */}
            <div ref={printRef} id="printable-receipt" className="space-y-5">
              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-slate-200 pb-4">
                <h2 className="text-2xl font-extrabold text-violet-700">FemCare</h2>
                <p className="text-sm text-slate-500">نظام إدارة عيادة النسائية والتوليد</p>
                <p className="text-xs text-slate-400 mt-1">إيصال رقم: {invoice.id.slice(0, 8).toUpperCase()}</p>
              </div>

              {/* Patient Info */}
              <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-1">المريض/ة</p>
                  <p className="font-bold text-slate-800">{invoice.patient?.fullName}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">رقم الملف</p>
                  <p className="font-bold text-slate-800">#{invoice.patient?.fileNumber}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">تاريخ الفاتورة</p>
                  <p className="font-semibold text-slate-700">{format(new Date(invoice.createdAt), "d MMMM yyyy", { locale: ar })}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">الحالة</p>
                  {cfg && StatusIcon && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${cfg.color}`}>
                      <StatusIcon className="h-3 w-3" /> {cfg.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <h3 className="font-bold text-slate-700 mb-2 text-sm">بنود الفاتورة</h3>
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100">
                    <th className="text-right py-2 text-xs text-slate-500">الوصف</th>
                    <th className="text-left py-2 text-xs text-slate-500">المبلغ</th>
                  </tr></thead>
                  <tbody>
                    {invoice.items?.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-2 text-slate-700">{item.description}</td>
                        <td className="py-2 text-left font-semibold">{Number(item.amount).toLocaleString()} د.ع</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600"><span>المجموع الجزئي</span><span>{Number(invoice.totalAmount).toLocaleString()} د.ع</span></div>
                {Number(invoice.discount) > 0 && <div className="flex justify-between text-red-600"><span>الخصم</span><span>- {Number(invoice.discount).toLocaleString()} د.ع</span></div>}
                {Number(invoice.tax) > 0 && <div className="flex justify-between text-slate-600"><span>الضريبة</span><span>+ {Number(invoice.tax).toLocaleString()} د.ع</span></div>}
                <div className="flex justify-between font-extrabold text-lg text-slate-800 border-t border-slate-200 pt-2">
                  <span>الصافي المطلوب</span><span>{Number(invoice.finalAmount).toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>المدفوع</span><span>{totalPaid.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between font-bold text-amber-600">
                  <span>المتبقي</span><span>{remaining.toLocaleString()} د.ع</span>
                </div>
              </div>

              {/* Payment History */}
              {invoice.payments?.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-700 mb-2 text-sm">سجل المدفوعات</h3>
                  <div className="space-y-2">
                    {invoice.payments.map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-2.5 text-sm">
                        <div className="text-emerald-700 font-bold">{Number(p.amount).toLocaleString()} د.ع</div>
                        <div className="text-slate-500 text-xs">{METHOD_OPTIONS.find(m => m.value === p.paymentMethod)?.label}</div>
                        <div className="text-slate-400 text-xs">{format(new Date(p.paymentDate), "d MMM yyyy", { locale: ar })}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ─── PAYMENT FORM (hidden on print) ─────────────────────────── */}
            {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
              <div className="border-t border-slate-100 pt-4 space-y-3 print:hidden">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" /> تسجيل دفعة جديدة
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">المبلغ (د.ع)</label>
                    <Input
                      type="number"
                      min="0"
                      placeholder={`المتبقي: ${remaining.toFixed(2)}`}
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">طريقة الدفع</label>
                    <Select value={payMethod} onValueChange={setPayMethod}>
                      <SelectTrigger dir="rtl" className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent dir="rtl">
                        {METHOD_OPTIONS.map(m => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handlePayment}
                  disabled={isPaying}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11"
                >
                  {isPaying ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="ml-2 h-4 w-4" />}
                  {isPaying ? "جاري التسجيل..." : "تسجيل الدفعة"}
                </Button>
              </div>
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
