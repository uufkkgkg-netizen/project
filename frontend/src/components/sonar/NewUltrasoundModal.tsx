"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";

const sonarSchema = z.object({
  patientId: z.string().min(1, "يرجى اختيار مريضة"),
  date: z.string().min(1, "تاريخ الفحص مطلوب"),
  findings: z.string().min(1, "النتائج الطبية مطلوبة"),
  imageUrl: z.string().optional(),
});

type SonarFormValues = z.infer<typeof sonarSchema>;

type Patient = {
  id: string;
  fullName: string;
};

type NewUltrasoundModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function NewUltrasoundModal({ isOpen, onClose, onSuccess }: NewUltrasoundModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isPatientsLoading, setIsPatientsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SonarFormValues>({
    resolver: zodResolver(sonarSchema),
    defaultValues: {
      patientId: "",
      date: new Date().toISOString().split('T')[0],
      findings: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (isOpen && patients.length === 0) {
      fetchPatients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const fetchPatients = async () => {
    setIsPatientsLoading(true);
    try {
      const response = await api.get<Patient[]>("/patients");
      setPatients(response.data);
    } catch (error) {
      toast.error("فشل جلب قائمة المرضى");
    } finally {
      setIsPatientsLoading(false);
    }
  };

  const onSubmit = async (data: SonarFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        patientId: data.patientId,
        date: data.date,
        findings: data.findings,
        imageUrls: data.imageUrl ? [data.imageUrl] : [],
      };
      
      await api.post("/sonar", payload);
      toast.success("تم حفظ تقرير السونار بنجاح");
      onSuccess();
    } catch (error: any) {
      toast.error("فشل حفظ التقرير", {
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl text-indigo-800">تقرير سونار جديد</DialogTitle>
          <DialogDescription>
            قم بإضافة نتائج فحص السونار وإرفاق الصورة.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 flex-1 overflow-y-auto pr-2 mt-4">
            
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">المريضة <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPatientsLoading}>
                    <FormControl>
                      <SelectTrigger dir="rtl" className="h-11 rounded-xl">
                        <SelectValue placeholder={isPatientsLoading ? "جاري تحميل المرضى..." : "اختر مريضة من السجل"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl" className="max-h-60 rounded-xl">
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="cursor-pointer">
                          {p.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">تاريخ الفحص <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="date" className="h-11 rounded-xl bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="findings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">النتائج الطبية (Findings) <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="اكتب التقرير والتشخيص هنا..." 
                      className="resize-none rounded-xl bg-white min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">رابط صورة السونار (اختياري)</FormLabel>
                  <div className="flex gap-2 items-center">
                    <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-slate-400 shrink-0">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        className="h-11 rounded-xl bg-white w-full text-left" 
                        dir="ltr"
                        {...field} 
                      />
                    </FormControl>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">يمكنك لصق رابط للصورة مؤقتاً لحين تفعيل خدمة الرفع المباشر للملفات.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
              <Button 
                type="submit" 
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 rounded-xl h-11 px-8" 
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "جاري الحفظ..." : "حفظ التقرير"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
