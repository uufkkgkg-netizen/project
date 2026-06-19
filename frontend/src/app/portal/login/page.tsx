"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Phone, FileText, HeartPulse } from "lucide-react";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";

const loginSchema = z.object({
  phone: z.string().min(5, "رقم الهاتف مطلوب"),
  fileNumber: z.string().min(1, "رقم الملف مطلوب"),
});

type FormValues = z.infer<typeof loginSchema>;

export default function PortalLoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      fileNumber: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/patient-portal/auth/login", data);
      const { patient } = response.data;
      
      localStorage.setItem("portal_patient", JSON.stringify(patient));
      
      toast.success(`أهلاً بك، ${patient.fullName}`);
      router.push("/portal");
    } catch (err: any) {
      toast.error("فشل تسجيل الدخول", {
        description: err.response?.data?.message || "يرجى التحقق من رقم الهاتف أو رقم الملف.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/50 flex flex-col items-center justify-center p-4 font-sans" dir="rtl">
      
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-rose-500">
          <HeartPulse className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">بوابة المريضة</h1>
        <p className="text-slate-500 text-center max-w-sm">
          أهلاً بكِ في عيادتك الخاصة. يمكنك متابعة مواعيدك، السونار، والوصفات الطبية.
        </p>
      </div>

      <Card className="w-full max-w-md rounded-3xl border-0 shadow-xl overflow-hidden bg-white/80 backdrop-blur-md">
        <CardHeader className="pb-6 pt-8 px-8 text-center border-b border-slate-50">
          <CardTitle className="text-2xl font-bold text-slate-800">تسجيل الدخول</CardTitle>
          <CardDescription className="text-base mt-2">
            يرجى إدخال رقم الهاتف ورقم الملف الطبي
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">رقم الهاتف</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input 
                        placeholder="مثال: 07800000000" 
                        className="h-14 rounded-2xl pr-12 text-lg bg-slate-50 border-slate-200 focus-visible:ring-rose-500" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="fileNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">رقم الملف (ID)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input 
                        type="number"
                        placeholder="أدخل رقم الملف الخاص بك" 
                        className="h-14 rounded-2xl pr-12 text-lg bg-slate-50 border-slate-200 focus-visible:ring-rose-500" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-lg font-bold shadow-lg shadow-rose-200 mt-4 transition-all hover:-translate-y-1"
              >
                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "دخول للبوابة"}
              </Button>
              
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <p className="mt-8 text-slate-400 text-sm">
        إذا واجهتِ مشكلة في الدخول، يرجى مراجعة موظف الاستقبال.
      </p>
    </div>
  );
}
