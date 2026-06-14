"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { TopKpiCards } from "@/components/dashboard/TopKpiCards";
import { PregnancyWidget } from "@/components/dashboard/PregnancyWidget";
import { MenstrualCycleWidget } from "@/components/dashboard/MenstrualCycleWidget";
import { AlertsWidget } from "@/components/dashboard/AlertsWidget";
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar";
import { RecentGrids } from "@/components/dashboard/RecentGrids";
import { Loader2 } from "lucide-react";

export default function DashboardOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, billingRes, ultrasoundRes, prescriptionsRes] = await Promise.allSettled([
          api.get("/analytics/summary"),
          api.get("/billing/summary"),
          api.get("/sonar"),
          api.get("/prescriptions"),
        ]);

        setData({
          analytics:     analyticsRes.status     === "fulfilled" ? analyticsRes.value.data     : null,
          billing:       billingRes.status        === "fulfilled" ? billingRes.value.data        : null,
          ultrasounds:   ultrasoundRes.status     === "fulfilled" ? ultrasoundRes.value.data     : [],
          prescriptions: prescriptionsRes.status  === "fulfilled" ? prescriptionsRes.value.data  : [],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setData({ analytics: null, billing: null, ultrasounds: [], prescriptions: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pb-10">
        {/* KPI Skeletons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-medical p-5 space-y-3">
              <div className="h-4 w-24 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
        {/* Content Skeletons */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 card-medical p-6 space-y-3">
            <div className="h-5 w-32 bg-slate-100 rounded-lg animate-pulse" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
          <div className="card-medical p-6 space-y-3">
            <div className="h-5 w-24 bg-slate-100 rounded-lg animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 pb-10">
      
      {/* ── MAIN CONTENT AREA (Center & Left from image perspective, RTL makes it Right & Center) ── */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* 1. TOP KPI CARDS */}
        <TopKpiCards analytics={data?.analytics} billing={data?.billing} />

        {/* 2. MIDDLE ROW: Alerts, Pregnancy, Menstrual Cycle */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 h-full">
            <AlertsWidget />
          </div>
          <div className="lg:col-span-6 h-full">
            <PregnancyWidget />
          </div>
          <div className="lg:col-span-3 h-full">
            <MenstrualCycleWidget />
          </div>
        </div>

        {/* 3. BOTTOM ROW: Recent Grids & Charts */}
        <RecentGrids 
          ultrasounds={data?.ultrasounds} 
          prescriptions={data?.prescriptions} 
        />

      </div>

      {/* ── SIDEBAR AREA (Calendar & Upcoming) ── */}
      <div className="w-full xl:w-[320px] shrink-0 flex flex-col gap-6">
        <DashboardCalendar />
      </div>

    </div>
  );
}
