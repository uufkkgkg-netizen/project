"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Users, CalendarCheck, FileText, TrendingUp } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from "recharts";
import { toast } from "sonner";
import api from "@/lib/api";

type WeeklyOverviewItem = {
  name: string;
  count: number;
};

type AnalyticsSummary = {
  totalPatients: number;
  appointmentsToday: number;
  totalMedicalRecords: number;
  weeklyOverview: WeeklyOverviewItem[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get<AnalyticsSummary>("/analytics/summary");
      setData(response.data);
    } catch (error) {
      toast.error("فشل جلب بيانات الإحصائيات");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-rose-600" />
        <p className="text-slate-500 font-medium">جاري تحليل البيانات...</p>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      title: "إجمالي المرضى",
      value: data.totalPatients,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
      description: "إجمالي الملفات الطبية المسجلة",
    },
    {
      title: "مواعيد اليوم",
      value: data.appointmentsToday,
      icon: CalendarCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      description: "المواعيد المجدولة لهذا اليوم",
    },
    {
      title: "السجلات الطبية",
      value: data.totalMedicalRecords,
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-100",
      description: "إجمالي السجلات المدخلة",
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">الإحصائيات والتحليلات</h1>
          <p className="text-slate-500 mt-1 text-sm">نظرة عامة على أداء العيادة والمؤشرات الرئيسية.</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                  <p className="text-3xl font-black text-slate-800">{stat.value}</p>
                </div>
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-7 w-7" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-xs text-slate-400">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Bar Chart */}
        <Card className="border-slate-100 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">مواعيد الأسبوع الجاري</CardTitle>
            <CardDescription>عدد المواعيد المحجوزة خلال الأيام السبعة الماضية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyOverview} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} name="المواعيد" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Line Chart (Trend) */}
        <Card className="border-slate-100 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">اتجاه المواعيد</CardTitle>
            <CardDescription>النمط التدريجي للمواعيد لنفس الفترة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weeklyOverview} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#0ea5e9' }} name="المواعيد" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
