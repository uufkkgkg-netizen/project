"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save, Building2, Phone, Mail, MapPin, Image as ImageIcon, DollarSign } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "اسم العيادة مطلوب"),
  contactEmail: z.string().email("البريد الإلكتروني غير صالح").or(z.literal("")).optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  defaultCurrency: z.string().min(1, "اختر العملة"),
  logoUrl: z.string().url("رابط الشعار غير صالح").or(z.literal("")).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ClinicSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", contactEmail: "", contactPhone: "", address: "", defaultCurrency: "IQD", logoUrl: ""
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings");
        form.reset({
          name: res.data.name || "",
          contactEmail: res.data.contactEmail || "",
          contactPhone: res.data.contactPhone || "",
          address: res.data.address || "",
          defaultCurrency: res.data.defaultCurrency || "IQD",
          logoUrl: res.data.logoUrl || "",
        });
      } catch (err: any) {
        toast.error("فشل جلب إعدادات العيادة", {
          description: err.response?.data?.message || "قد لا تملك الصلاحية للوصول.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await api.patch("/settings", data);
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (err: any) {
      toast.error("فشل حفظ الإعدادات", {
        description: err.response?.data?.message || "حدث خطأ غير متوقع",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[500px]"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">إعدادات العيادة</h1>
            <p className="text-slate-500 mt-1 text-sm">تخصيص البيانات الأساسية، التواصل، والمظهر</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-purple-500" /> الهوية المرئية والأساسيات
              </CardTitle>
              <CardDescription>هذه البيانات ستظهر في الإيصالات والتقارير المطبوعة.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم العيادة <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input className="h-11 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="logoUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الشعار (Logo URL)</FormLabel>
                    <FormControl><Input placeholder="https://..." className="h-11 rounded-xl text-left" dir="ltr" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-500" /> معلومات التواصل
              </CardTitle>
              <CardDescription>كيف يمكن للمرضى التواصل مع عيادتك.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="contactPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl><Input className="h-11 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="contactEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl><Input type="email" className="h-11 rounded-xl text-left" dir="ltr" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> العنوان التفصيلي</FormLabel>
                  <FormControl><Input className="h-11 rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-500" /> الإعدادات المالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md">
                <FormField control={form.control} name="defaultCurrency" render={({ field }) => (
                  <FormItem>
                    <FormLabel>العملة الافتراضية للفواتير</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger dir="rtl" className="h-11 rounded-xl"><SelectValue placeholder="اختر العملة" /></SelectTrigger></FormControl>
                      <SelectContent dir="rtl">
                        <SelectItem value="IQD">دينار عراقي (IQD)</SelectItem>
                        <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                        <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                        <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                        <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" className="rounded-xl h-11 px-8" onClick={() => form.reset()}>
              إلغاء التغييرات
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 rounded-xl h-11 px-8 shadow-md">
              {isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
              {isSubmitting ? "جاري الحفظ…" : "حفظ التغييرات"}
            </Button>
          </div>
          
        </form>
      </Form>

    </div>
  );
}
