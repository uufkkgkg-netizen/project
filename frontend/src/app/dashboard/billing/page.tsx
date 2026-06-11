"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Receipt, Plus, Loader2, Search, CheckCircle2, Clock, AlertCircle, XCircle, 
  Printer, CreditCard, DollarSign, TrendingUp, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";
import { NewInvoiceModal } from "@/components/billing/NewInvoiceModal";
import { InvoiceDetailModal } from "@/components/billing/InvoiceDetailModal";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  UNPAID:        { label: "غير مدفوع",    color: "bg-red-100 text-red-700 border-red-200",       icon: AlertCircle },
  PARTIALLY_PAID:{ label: "مدفوع جزئياً", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  PAID:          { label: "مدفوع",         color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  CANCELLED:     { label: "ملغى",          color: "bg-slate-100 text-slate-500 border-slate-200", icon: XCircle },
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [summary, setSummary]   = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [invoicesRes, summaryRes] = await Promise.all([
        api.get("/billing"),
        api.get("/billing/summary"),
      ]);
      setInvoices(invoicesRes.data);
      setSummary(summaryRes.data);
    } catch {
      toast.error("فشل جلب بيانات الفواتير");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = invoices.filter((inv) => {
    const matchStatus = statusFilter === "ALL" || inv.status === statusFilter;
    const matchSearch = !searchQuery ||
      inv.patient?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">الفواتير والمدفوعات</h1>
            <p className="text-slate-500 mt-1 text-sm">إدارة مالية شاملة لإيرادات العيادة</p>
          </div>
        </div>
        <Button onClick={() => setIsNewModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-6 h-11">
          <Plus className="ml-2 h-4 w-4" /> فاتورة جديدة
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "إجمالي الفواتير", value: `${summary.totalInvoiced?.toFixed(2)} د.ع`, icon: Receipt,     color: "from-violet-500 to-purple-600" },
            { label: "المحصّل فعلياً",  value: `${summary.totalCollected?.toFixed(2)} د.ع`, icon: DollarSign, color: "from-emerald-500 to-green-600" },
            { label: "المتأخرة (غير مدفوعة)", value: `${summary.unpaidCount} فاتورة`,       icon: AlertCircle, color: "from-red-500 to-rose-600" },
            { label: "مدفوع جزئياً",    value: `${summary.partialCount} فاتورة`,             icon: Clock,       color: "from-amber-500 to-orange-600" },
          ].map((card) => (
            <Card key={card.label} className="rounded-2xl border-none shadow-md overflow-hidden">
              <CardContent className={`p-5 bg-gradient-to-br ${card.color} text-white`}>
                <card.icon className="h-7 w-7 mb-3 opacity-80" />
                <p className="text-2xl font-extrabold">{card.value}</p>
                <p className="text-sm mt-1 opacity-80">{card.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="البحث باسم المريض أو رقم الفاتورة..."
            className="pr-10 rounded-xl h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "UNPAID", "PARTIALLY_PAID", "PAID", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                statusFilter === s
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
              }`}
            >
              {s === "ALL" ? "الكل" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-12">
            <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">لا توجد فواتير مطابقة لبحثك.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">المريض</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">المبلغ الإجمالي</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">المدفوع</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">التاريخ</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">الحالة</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((inv) => {
                const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.UNPAID;
                const Icon = cfg.icon;
                const totalPaid = inv.payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) ?? 0;
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {inv.patient?.fullName}
                      <span className="text-xs text-slate-400 mr-2">ملف #{inv.patient?.fileNumber}</span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-700">{Number(inv.finalAmount).toLocaleString()} د.ع</td>
                    <td className="px-5 py-4 text-emerald-600 font-semibold">{totalPaid.toLocaleString()} د.ع</td>
                    <td className="px-5 py-4 text-slate-500">{format(new Date(inv.createdAt), "d MMM yyyy", { locale: ar })}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${cfg.color}`}>
                        <Icon className="h-3.5 w-3.5" />{cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg h-8 px-3 text-violet-700 border-violet-200 hover:bg-violet-50"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        التفاصيل
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <NewInvoiceModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} onSuccess={fetchAll} />
      {selectedInvoice && (
        <InvoiceDetailModal
          invoiceId={selectedInvoice.id}
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSuccess={fetchAll}
        />
      )}
    </div>
  );
}
