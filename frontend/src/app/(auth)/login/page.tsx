"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

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
      const response = await api.post("/auth/login", data);

      const { access_token, user } = response.data;

      if (!access_token) throw new Error("لم يتم العثور على التوكن في الاستجابة");

      // 1. Store token in localStorage (used by axios interceptor for Authorization header)
      localStorage.setItem("access_token", access_token);

      // 2. Store user info for display (non-sensitive)
      localStorage.setItem("user_info", JSON.stringify(user));

      // 3. Set a readable cookie for Next.js middleware (to decode role for RBAC)
      //    This is separate from the HttpOnly cookie set by the backend
      document.cookie = `access_token=${access_token}; path=/; max-age=86400; SameSite=Lax`;

      toast.success("تم تسجيل الدخول بنجاح", {
        description: "جاري تحويلك إلى لوحة التحكم...",
      });

      router.push("/dashboard");
    } catch (error: any) {
      toast.error("فشل تسجيل الدخول", {
        description: error.response?.data?.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="card-medical border-0 shadow-none bg-transparent sm:bg-white sm:shadow-xl sm:border-slate-200">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-2xl font-bold text-slate-900">تسجيل الدخول</CardTitle>
        <CardDescription className="text-base">
          أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى عيادتك.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input type="email" dir="ltr" className="text-left pr-10" {...field} />
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
                    <FormLabel>كلمة المرور</FormLabel>
                    <Link href="#" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input type="password" dir="ltr" className="text-left pr-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-11 text-base shadow-brand" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm text-slate-600">
          ليس لديك حساب عيادة?{" "}
          <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            سجل عيادتك الآن
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
