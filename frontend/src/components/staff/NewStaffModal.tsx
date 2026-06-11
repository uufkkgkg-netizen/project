"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, User, Mail, Phone, KeyRound, ShieldCheck } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";

const schema = z.object({
  firstName: z.string().min(2, "الاسم الأول مطلوب"),
  lastName:  z.string().min(2, "الاسم الأخير مطلوب"),
  email:     z.string().email("البريد الإلكتروني غير صحيح"),
  phone:     z.string().optional(),
  role:      z.enum(["DOCTOR", "RECEPTIONIST", "ACCOUNTANT", "NURSE"] as const),
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"),
});

type FormValues = z.infer<typeof schema>;
type Props = { isOpen: boolean; onClose: () => void; onSuccess: () => void };

const ROLE_OPTIONS = [
  { value: "DOCTOR",       label: "طبيب/ة" },
  { value: "RECEPTIONIST", label: "موظف استقبال" },
  { value: "ACCOUNTANT",   label: "محاسب" },
  { value: "NURSE",        label: "ممرض/ة" },
];

export function NewStaffModal({ isOpen, onClose, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", role: "DOCTOR", password: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await api.post("/staff", data);
      toast.success(`تم إنشاء حساب ${data.firstName} ${data.lastName} بنجاح`);
      form.reset();
      onSuccess();
    } catch (err: any) {
      toast.error("فشل إنشاء الحساب", {
        description: err.response?.data?.message || "حدث خطأ غير متوقع",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-violet-800 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> إضافة موظف جديد
          </DialogTitle>
          <DialogDescription>سيتم إرسال بيانات الدخول للموظف عبر البريد الإلكتروني.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-3">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الأول <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input placeholder="مثال: سارة" className="pr-10 h-11 rounded-xl" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الأخير <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: أحمد" className="h-11 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Email */}
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>البريد الإلكتروني <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input type="email" placeholder="sara@clinic.com" className="pr-10 h-11 rounded-xl" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Phone + Role */}
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>الهاتف</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input placeholder="+9647..." className="pr-10 h-11 rounded-xl" {...field} />
                    </div>
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>الدور <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger dir="rtl" className="h-11 rounded-xl">
                        <SelectValue placeholder="اختر الدور" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl" className="rounded-xl">
                      {ROLE_OPTIONS.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Password */}
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>كلمة المرور <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <div className="relative">
                    <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input type="password" placeholder="8 أحرف على الأقل" className="pr-10 h-11 rounded-xl" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button type="button" variant="ghost" className="ml-2" onClick={onClose} disabled={isSubmitting}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}
                className="bg-violet-600 hover:bg-violet-700 rounded-xl h-11 px-8">
                {isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "جاري الحفظ…" : "إنشاء الحساب"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
