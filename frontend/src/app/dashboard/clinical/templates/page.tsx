"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText, Plus, Search, Stethoscope, Microscope, Pill,
  CalendarCheck, LayoutTemplate, Edit2, Trash2, Copy,
  Loader2, X, Sparkles, CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────
type Category = "ULTRASOUND" | "DIAGNOSIS" | "PRESCRIPTION" | "FOLLOW_UP" | "GENERAL";

type Template = {
  id: string;
  title: string;
  category: Category;
  content: string;
  isActive: boolean;
  createdAt: string;
  creator?: { firstName: string; lastName: string } | null;
};

// ── Config ─────────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<Category, { label: string; icon: React.ReactNode; gradient: string; ring: string }> = {
  ULTRASOUND:   { label: "سونار",          icon: <Microscope className="h-4 w-4" />,    gradient: "from-violet-500 to-purple-600",  ring: "ring-violet-200 bg-violet-50 text-violet-700" },
  DIAGNOSIS:    { label: "تشخيص",          icon: <Stethoscope className="h-4 w-4" />,   gradient: "from-blue-500 to-cyan-600",      ring: "ring-blue-200 bg-blue-50 text-blue-700" },
  PRESCRIPTION: { label: "وصفة طبية",      icon: <Pill className="h-4 w-4" />,          gradient: "from-emerald-500 to-teal-600",   ring: "ring-emerald-200 bg-emerald-50 text-emerald-700" },
  FOLLOW_UP:    { label: "متابعة",          icon: <CalendarCheck className="h-4 w-4" />, gradient: "from-amber-500 to-orange-600",   ring: "ring-amber-200 bg-amber-50 text-amber-700" },
  GENERAL:      { label: "عام",             icon: <LayoutTemplate className="h-4 w-4" />, gradient: "from-slate-500 to-slate-600",   ring: "ring-slate-200 bg-slate-50 text-slate-700" },
};

// ── Quick-insert variables ──────────────────────────────────────────────
const VARIABLES = [
  { label: "اسم المريضة",   value: "{{patient_name}}",    arabic: "اسم المريضة" },
  { label: "العمر",          value: "{{age}}",              arabic: "العمر" },
  { label: "التاريخ",       value: "{{date}}",             arabic: "التاريخ" },
  { label: "فصيلة الدم",    value: "{{blood_type}}",       arabic: "فصيلة الدم" },
  { label: "رقم الهاتف",   value: "{{patient_phone}}",    arabic: "رقم الهاتف" },
  { label: "رقم الملف",    value: "{{file_number}}",      arabic: "رقم الملف" },
  { label: "أسابيع الحمل", value: "{{weeks_pregnant}}",   arabic: "أسابيع الحمل" },
  { label: "رقم الجلسة",   value: "{{session_number}}",   arabic: "رقم الجلسة" },
];

// ── Smart Textarea Editor ──────────────────────────────────────────────
// Renders {{variable}} as readable [arabic label] chips inside the textarea
// by keeping a hidden div display layer + real textarea for editing.
function SmartEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertVariable = (varValue: string) => {
    const ta = textareaRef.current;
    if (!ta) { onChange(value + " " + varValue + " "); return; }
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const before = value.substring(0, start);
    const after  = value.substring(end);
    // Add spaces around if needed
    const needSpaceBefore = before.length > 0 && before[before.length - 1] !== " " && before[before.length - 1] !== "\n";
    const needSpaceAfter  = after.length > 0 && after[0] !== " " && after[0] !== "\n";
    const insert = (needSpaceBefore ? " " : "") + varValue + (needSpaceAfter ? " " : "");
    const newVal = before + insert + after;
    onChange(newVal);
    const newPos = start + insert.length;
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Convert {{var}} → readable preview for display only
  const preview = value.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
    const v = VARIABLES.find(v => v.value === `{{${key}}}`);
    return v ? `[${v.arabic}]` : `[${key}]`;
  });

  return (
    <div className="space-y-3">
      {/* Variable chips */}
      <div className="flex flex-wrap gap-2">
        {VARIABLES.map(v => (
          <button
            key={v.value}
            type="button"
            onClick={() => insertVariable(v.value)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg ring-1 ring-indigo-200 hover:bg-indigo-100 active:scale-95 transition-all font-semibold"
          >
            <Plus className="h-3 w-3" />
            {v.label}
          </button>
        ))}
      </div>

      {/* Preview banner */}
      {value && (
        <div
          dir="rtl"
          className="w-full min-h-[60px] bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-900 leading-7 font-medium"
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {preview.split(/(\[.*?\])/g).map((part, i) =>
            part.startsWith("[") && part.endsWith("]") ? (
              <span key={i} className="inline-flex items-center px-2 py-0.5 mx-0.5 rounded-md bg-indigo-200 text-indigo-800 text-xs font-bold ring-1 ring-indigo-300">
                {part.slice(1, -1)}
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </div>
      )}

      {/* Real editable textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={10}
          placeholder={placeholder}
          dir="auto"
          className="w-full resize-none bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow font-mono"
        />
        <span className="absolute bottom-3 left-4 text-xs text-slate-400">{value.length} حرف</span>
      </div>
    </div>
  );
}

// ── Template Modal Component ─────────────────────────────────────────────
function TemplateModal({
  template,
  onClose,
  onSaved,
}: {
  template: Template | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!template;
  const [title, setTitle]       = useState(template?.title ?? "");
  const [category, setCategory] = useState<Category>(template?.category ?? "GENERAL");
  const [content, setContent]   = useState(template?.content ?? "");
  const [saving, setSaving]     = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("العنوان مطلوب"); return; }
    if (!content.trim()) { toast.error("المحتوى مطلوب"); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/templates/${template!.id}`, { title, category, content });
        toast.success("تم تحديث القالب بنجاح");
      } else {
        await api.post("/templates", { title, category, content });
        toast.success("تم إنشاء القالب بنجاح");
      }
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "حدث خطأ غير متوقع");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Sparkles className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isEdit ? "تعديل القالب" : "قالب جديد"}
              </h2>
              <p className="text-xs text-slate-500">استخدم أزرار المتغيرات لحقن البيانات تلقائياً عند توليد التقرير</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">عنوان القالب</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: سونار حمل طبيعي — الأسبوع 20"
              className="bg-slate-50 border-slate-200 rounded-xl h-11"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">التصنيف</label>
            <Select value={category} onValueChange={(v: string | null) => setCategory((v || "GENERAL") as Category)}>
              <SelectTrigger dir="rtl" className="w-full bg-slate-50 border-slate-200 rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {(Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => (
                  <SelectItem key={cat} value={cat}>
                    <span className="flex items-center gap-2">
                      {CATEGORY_CONFIG[cat].icon} {CATEGORY_CONFIG[cat].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Smart Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">محتوى القالب</label>
              <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">المعاينة أعلاه تُظهر كيف سيبدو التقرير</span>
            </div>
            <SmartEditor
              value={content}
              onChange={setContent}
              placeholder={"اكتب محتوى القالب هنا...\nمثال: المريضة {{patient_name}} بعمر {{age}} عاماً\nالموجودات: رأس الجنين طبيعي، الحركة جيدة..."}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl sticky bottom-0">
          <Button variant="outline" className="rounded-xl" onClick={onClose} disabled={saving}>
            إلغاء
          </Button>
          <Button
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-6"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {isEdit ? "حفظ التعديلات" : "إنشاء القالب"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────
export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [modal, setModal]         = useState<{ open: boolean; template: Template | null }>({ open: false, template: null });

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = catFilter !== "all" ? { category: catFilter } : {};
      const res = await api.get<Template[]>("/templates", { params });
      setTemplates(res.data);
    } catch {
      toast.error("فشل تحميل القوالب");
    } finally {
      setLoading(false);
    }
  }, [catFilter]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذا القالب؟ لن يظهر للمستخدمين.")) return;
    try {
      await api.delete(`/templates/${id}`);
      toast.success("تم حذف القالب");
      fetchTemplates();
    } catch {
      toast.error("فشل حذف القالب");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("تم نسخ محتوى القالب");
  };

  const filtered = search
    ? templates.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.content.toLowerCase().includes(search.toLowerCase())
      )
    : templates;

  // Group by category
  const grouped = (Object.keys(CATEGORY_CONFIG) as Category[]).reduce((acc, cat) => {
    acc[cat] = filtered.filter(t => t.category === cat);
    return acc;
  }, {} as Record<Category, Template[]>);

  return (
    <>
      {modal.open && (
        <TemplateModal
          template={modal.template}
          onClose={() => setModal({ open: false, template: null })}
          onSaved={fetchTemplates}
        />
      )}

      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-md">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">القوالب الطبية</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                قوالب جاهزة تُوفر وقت الطبيب وتضمن اتساق التقارير السريرية.
              </p>
            </div>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-sm"
            onClick={() => setModal({ open: true, template: null })}
          >
            <Plus className="h-4 w-4" /> قالب جديد
          </Button>
        </div>

        {/* Filters */}
        <Card className="border border-slate-100 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="بحث في القوالب..."
                className="pr-10 bg-slate-50 border-none rounded-xl h-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={catFilter} onValueChange={(v: string | null) => setCatFilter(v || "all")}>
              <SelectTrigger dir="rtl" className="w-44 h-10 rounded-xl bg-slate-50 border-none">
                <SelectValue placeholder="كل التصنيفات" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">كل التصنيفات</SelectItem>
                {(Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => (
                  <SelectItem key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-400">{filtered.length} قالب</span>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <div className="p-6 bg-slate-100 rounded-2xl">
              <FileText className="h-12 w-12 text-slate-300" />
            </div>
            <p className="text-slate-500 font-semibold text-lg">لا توجد قوالب مطابقة</p>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2"
              onClick={() => setModal({ open: true, template: null })}
            >
              <Plus className="h-4 w-4" /> أنشئ أول قالب
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {(Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => {
              const items = catFilter === "all" ? grouped[cat] : (cat === catFilter ? filtered : []);
              if (!items || items.length === 0) return null;
              const conf = CATEGORY_CONFIG[cat];
              return (
                <div key={cat}>
                  {/* Category Header */}
                  <div className={`flex items-center gap-3 mb-4`}>
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${conf.gradient} text-white shadow-sm`}>
                      {conf.icon}
                    </div>
                    <h2 className="text-lg font-bold text-slate-700">{conf.label}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset ${conf.ring}`}>
                      {items.length}
                    </span>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {items.map(template => (
                      <Card
                        key={template.id}
                        className="border border-slate-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow group"
                      >
                        <CardContent className="p-5 flex flex-col h-full gap-3">
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">
                              {template.title}
                            </h3>
                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ring-inset ${conf.ring}`}>
                              {conf.label}
                            </span>
                          </div>

                          {/* Content Preview — show readable version */}
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-4 flex-1 font-mono">
                            {template.content.substring(0, 160)}{template.content.length > 160 ? "..." : ""}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                            <span className="text-[10px] text-slate-400">
                              {template.creator
                                ? `${template.creator.firstName} ${template.creator.lastName}`
                                : "النظام"}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleCopy(template.content)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                title="نسخ المحتوى"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setModal({ open: true, template })}
                                className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                                title="تعديل"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(template.id)}
                                className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
