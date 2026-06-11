"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert, Search, Filter, RefreshCw, Loader2, Eye,
  ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2,
  Trash2, Edit, Plus, LogIn, Ban, Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────
type AuditEntry = {
  id: string;
  tenantId: string | null;
  userId: string | null;
  userEmail: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  ipAddress: string | null;
  statusCode: number | null;
  path: string | null;
  method: string | null;
  createdAt: string;
};

type AuditResponse = {
  data: AuditEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ── Config ────────────────────────────────────────────────────
const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; classes: string }> = {
  CREATE:  { label: "إنشاء",   icon: <Plus className="h-3 w-3" />,          classes: "bg-emerald-100 text-emerald-700 ring-emerald-600/20" },
  UPDATE:  { label: "تعديل",   icon: <Edit className="h-3 w-3" />,           classes: "bg-blue-100 text-blue-700 ring-blue-600/20" },
  DELETE:  { label: "حذف",    icon: <Trash2 className="h-3 w-3" />,          classes: "bg-red-100 text-red-700 ring-red-600/20" },
  ACCESS:  { label: "وصول",   icon: <Eye className="h-3 w-3" />,             classes: "bg-slate-100 text-slate-600 ring-slate-600/20" },
  LOGIN:   { label: "تسجيل دخول", icon: <LogIn className="h-3 w-3" />,      classes: "bg-violet-100 text-violet-700 ring-violet-600/20" },
  SUSPEND: { label: "تعليق",   icon: <Ban className="h-3 w-3" />,            classes: "bg-amber-100 text-amber-700 ring-amber-600/20" },
};

const ENTITIES = [
  "PATIENT","APPOINTMENT","INVOICE","PRESCRIPTION",
  "ULTRASOUND","STAFF","AUTH","ADMIN","ANALYTICS","SYSTEM",
];
const ACTIONS = ["CREATE","UPDATE","DELETE","ACCESS","LOGIN","SUSPEND"];

// ── Component ─────────────────────────────────────────────────
export default function AuditPage() {
  const [logs, setLogs]         = useState<AuditEntry[]>([]);
  const [meta, setMeta]         = useState<Omit<AuditResponse, "data"> | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [page, setPage]         = useState(1);

  // Filters
  const [search, setSearch]     = useState("");
  const [action, setAction]     = useState("all");
  const [entity, setEntity]     = useState("all");
  const [from, setFrom]         = useState("");
  const [to, setTo]             = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "50" };
      if (action !== "all") params.action = action;
      if (entity !== "all") params.entity = entity;
      if (from)             params.from   = from;
      if (to)               params.to     = to;

      const res = await api.get<AuditResponse>("/audit", { params });
      setLogs(res.data.data);
      setMeta({ total: res.data.total, page: res.data.page, limit: res.data.limit, totalPages: res.data.totalPages });
    } catch {
      toast.error("فشل جلب سجل التدقيق");
    } finally {
      setLoading(false);
    }
  }, [page, action, entity, from, to]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = search
    ? logs.filter(l =>
        [l.userEmail, l.path, l.entityId, l.entity, l.action]
          .join(" ").toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-white rounded-xl">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">سجل التدقيق الشامل</h1>
            <p className="text-slate-500 mt-1 text-sm">
              مراقبة كاملة لجميع العمليات التي تمت في النظام — للإدارة العليا فقط.
            </p>
          </div>
        </div>
        <Button
          onClick={() => { setPage(1); fetchLogs(); }}
          variant="outline"
          className="gap-2 rounded-xl border-slate-200"
        >
          <RefreshCw className="h-4 w-4" /> تحديث
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-slate-100 shadow-sm rounded-2xl">
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="بحث بالبريد، المسار، أو الـ ID…"
                className="pr-10 bg-slate-50 border-none rounded-xl h-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Action filter */}
            <Select value={action} onValueChange={(v: string | null) => { setAction(v || "all"); setPage(1); }}>
              <SelectTrigger dir="rtl" className="w-36 h-10 rounded-xl bg-slate-50 border-none">
                <SelectValue placeholder="الإجراء" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">كل الإجراءات</SelectItem>
                {ACTIONS.map(a => <SelectItem key={a} value={a}>{ACTION_CONFIG[a]?.label ?? a}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Entity filter */}
            <Select value={entity} onValueChange={(v: string | null) => { setEntity(v || "all"); setPage(1); }}>
              <SelectTrigger dir="rtl" className="w-40 h-10 rounded-xl bg-slate-50 border-none">
                <SelectValue placeholder="الكيان" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">كل الكيانات</SelectItem>
                {ENTITIES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Date range */}
            <input
              type="date"
              className="h-10 px-3 rounded-xl bg-slate-50 border-none text-sm text-slate-700 focus:ring-2 focus:ring-violet-300 outline-none"
              value={from}
              onChange={e => { setFrom(e.target.value); setPage(1); }}
              title="من تاريخ"
            />
            <input
              type="date"
              className="h-10 px-3 rounded-xl bg-slate-50 border-none text-sm text-slate-700 focus:ring-2 focus:ring-violet-300 outline-none"
              value={to}
              onChange={e => { setTo(e.target.value); setPage(1); }}
              title="إلى تاريخ"
            />

            <Button
              variant="ghost"
              className="h-10 text-slate-500 rounded-xl hover:bg-slate-100"
              onClick={() => { setAction("all"); setEntity("all"); setFrom(""); setTo(""); setSearch(""); setPage(1); }}
            >
              <Filter className="h-4 w-4 ml-1" /> إعادة ضبط
            </Button>
          </div>

          {meta && (
            <p className="mt-3 text-xs text-slate-400">
              {meta.total.toLocaleString()} سجل إجمالي — الصفحة {meta.page} من {meta.totalPages}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50/60 text-slate-500 font-medium border-b border-slate-100 text-xs">
                <tr>
                  <th className="px-4 py-3">الوقت</th>
                  <th className="px-4 py-3">المستخدم</th>
                  <th className="px-4 py-3">الإجراء</th>
                  <th className="px-4 py-3">الكيان</th>
                  <th className="px-4 py-3">المسار</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3 text-left">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-300 mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Activity className="h-10 w-10 text-slate-200" />
                        <p className="text-slate-500 font-semibold">لا توجد سجلات مطابقة</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(log => {
                  const actionConf = ACTION_CONFIG[log.action];
                  const isError = log.statusCode && log.statusCode >= 400;
                  const isSuccess = log.statusCode && log.statusCode < 400;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Time */}
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap font-mono">
                        {new Date(log.createdAt).toLocaleString("ar-EG", {
                          month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit", second: "2-digit",
                        })}
                      </td>

                      {/* User */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-slate-800 max-w-[160px] truncate">
                          {log.userEmail ?? <span className="text-slate-400 italic">مجهول</span>}
                        </p>
                      </td>

                      {/* Action badge */}
                      <td className="px-4 py-3">
                        {actionConf ? (
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${actionConf.classes}`}>
                            {actionConf.icon} {actionConf.label}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">{log.action}</span>
                        )}
                      </td>

                      {/* Entity */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-700">{log.entity}</span>
                          {log.entityId && (
                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[80px]">
                              {log.entityId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Path */}
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-slate-500 font-mono max-w-[180px] truncate block">
                          {log.method && <span className="text-violet-600 font-bold">{log.method} </span>}
                          {log.path ?? "—"}
                        </span>
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                        {log.ipAddress ?? "—"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-left">
                        {log.statusCode ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ring-1 ring-inset ${
                            isError
                              ? "bg-red-50 text-red-600 ring-red-600/20"
                              : "bg-emerald-50 text-emerald-600 ring-emerald-600/20"
                          }`}>
                            {isError ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                            {log.statusCode}
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-white">
              <Button
                variant="outline" size="sm" className="rounded-xl gap-1"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
              >
                <ChevronRight className="h-4 w-4" /> السابق
              </Button>
              <span className="text-sm text-slate-500">
                الصفحة <span className="font-bold text-slate-800">{page}</span> من <span className="font-bold">{meta.totalPages}</span>
              </span>
              <Button
                variant="outline" size="sm" className="rounded-xl gap-1"
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages || isLoading}
              >
                التالي <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
