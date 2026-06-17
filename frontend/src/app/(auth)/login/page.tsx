"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Lock, Mail, HeartPulse } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import api, { tokenStore } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      // Backend sets HttpOnly cookie automatically.
      // Also store token in memory for cross-origin Bearer auth fallback.
      const result = await api.post("/auth/login", data);
      if (result.data?.access_token) {
        tokenStore.set(result.data.access_token, result.data.csrf_token);
      }

      toast.success("تم تسجيل الدخول بنجاح 🌸", {
        description: "جاري تحويلك إلى لوحة التحكم...",
      });

      router.push("/dashboard");
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 429) {
        toast.error("محاولات كثيرة جداً", {
          description: "تجاوزت الحد المسموح به. يرجى الانتظار دقيقة واحدة.",
        });
      } else {
        toast.error("فشل تسجيل الدخول", {
          description: error.response?.data?.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 shadow-lg shadow-rose-200 mb-2">
          <HeartPulse className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">مرحباً بك في FemCare 🌸</h1>
        <p className="text-slate-500 text-sm">نظام إدارة عيادة النسائية والتوليد</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-semibold">البريد الإلكتروني</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      type="email"
                      dir="ltr"
                      className="text-left pr-10 h-11 rounded-xl border-slate-200 focus:ring-2 focus:ring-rose-300"
                      placeholder="clinic@example.com"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-slate-700 font-semibold">كلمة المرور</FormLabel>
                  <Link href="#" className="text-xs text-rose-600 hover:text-rose-700 font-medium">
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      type="password"
                      dir="ltr"
                      className="text-left pr-10 h-11 rounded-xl border-slate-200 focus:ring-2 focus:ring-rose-300"
                      placeholder="••••••••"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11 text-base font-bold rounded-xl shadow-md shadow-rose-200 bg-gradient-to-l from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white border-0 transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري تسجيل الدخول...
              </>
            ) : "تسجيل الدخول"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-slate-500">
        ليس لديك حساب عيادة؟{" "}
        <Link href="/register" className="font-bold text-rose-600 hover:text-rose-700">
          سجّل عيادتك الآن
        </Link>
      </div>
    </div>
  );
}
