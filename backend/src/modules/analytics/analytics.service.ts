import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TenantContext } from '../../core/prisma/tenant.context';
import { AnalyticsSummaryDto, WeeklyOverviewDto } from './dto/analytics-summary.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private get tenantId(): string {
    const store = TenantContext.getStore();
    return store?.tenantId || '';
  }

  async getSummary(tenantIdParam: string): Promise<AnalyticsSummaryDto> {
    const tenantId = tenantIdParam || this.tenantId;
    
    // 1. Total Patients
    const totalPatients = await this.prisma.patient.count({
      where: { tenantId },
    });

    // 2. Appointments Today
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    const appointmentsToday = await this.prisma.appointment.count({
      where: {
        tenantId,
        appointmentDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // 3. Total Medical Records
    const totalMedicalRecords = await this.prisma.medicalRecord.count({
      where: { tenantId },
    });

    // 4. Weekly Overview (Last 7 days, including today)
    // Array of day names in Arabic (or English based on preference, using Arabic here as UI is Arabic)
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    
    const weeklyOverview: WeeklyOverviewDto[] = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentAppointments = await this.prisma.appointment.findMany({
      where: {
        tenantId,
        appointmentDate: {
          gte: sevenDaysAgo,
          lte: todayEnd,
        },
      },
      select: {
        appointmentDate: true,
      },
    });

    // Map appointments by date string "YYYY-MM-DD"
    const appointmentsByDate = new Map<string, number>();
    recentAppointments.forEach((app) => {
      const dateString = app.appointmentDate.toISOString().split('T')[0];
      appointmentsByDate.set(dateString, (appointmentsByDate.get(dateString) || 0) + 1);
    });

    // Generate the last 7 days array filling gaps with zero
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      weeklyOverview.push({
        name: dayNames[d.getDay()], // e.g. "الأحد"
        count: appointmentsByDate.get(dateString) || 0,
      });
    }

    return {
      totalPatients,
      appointmentsToday,
      totalMedicalRecords,
      weeklyOverview,
    };
  }
}
