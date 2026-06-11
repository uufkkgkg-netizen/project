export class WeeklyOverviewDto {
  name: string;
  count: number;
}

export class AnalyticsSummaryDto {
  totalPatients: number;
  appointmentsToday: number;
  totalMedicalRecords: number;
  weeklyOverview: WeeklyOverviewDto[];
}
