"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
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

const registerSchema = z.object({
  clinicName: z.string().min(3, "اسم العيادة يجب أن يكون 3 أحرف على الأقل"),
  subdomain: z.string().min(3, "الرابط الفرعي يجب أن يكون 3 أحرف على الأقل").regex(/^[a-z0-9-]+$/, "فقط أحرف إنجليزية صغيرة، أرقام، وشرطة (-)"),
  firstName: z.string().min(2, "الاسم الأول مطلوب"),
  lastName: z.string().min(2, "اسم العائلة مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      clinicName: "",
      subdomain: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    try {
      await api.post("/auth/register", data);
      toast.success("تم تسجيل العيادة بنجاح!", {
        description: "يمكنك الآن تسجيل الدخول بحسابك الجديد.",
      });
      router.push("/login");
    } catch (error: any) {
      toast.error("فشل التسجيل", {
        description: error.response?.data?.message || "حدث خطأ غير متوقع. حاول مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="card-medical border-0 shadow-none bg-transparent sm:bg-white sm:shadow-xl sm:border-slate-200">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-2xl font-bold text-slate-900">تسجيل عيادة جديدة</CardTitle>
        <CardDescription className="text-base">
          أدخل بيانات عيادتك للبدء باستخدام منصة FemCare.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="clinicName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم العيادة</FormLabel>
                    <FormControl>
                      <Input placeholder="عيادة الأمل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subdomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرابط الفرعي (Subdomain)</FormLabel>
                    <FormControl>
                      <div className="flex flex-row-reverse">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm" dir="ltr">
                          .femcare.iq
                        </span>
                        <Input 
                          placeholder="amal-clinic" 
                          className="rounded-l-none text-left" 
                          dir="ltr"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الأول للمدير</FormLabel>
                    <FormControl>
                      <Input placeholder="أحمد" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم العائلة</FormLabel>
                    <FormControl>
                      <Input placeholder="علي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="admin@amal.com" dir="ltr" className="text-left" {...field} />
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
                  <FormLabel>كلمة المرور</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" dir="ltr" className="text-left" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-11 text-base shadow-brand" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري التسجيل...
                </>
              ) : (
                "إنشاء حساب العيادة"
              )}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center text-sm text-slate-600">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            سجل الدخول من هنا
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
