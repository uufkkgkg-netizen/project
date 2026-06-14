export declare class WeeklyOverviewDto {
    name: string;
    count: number;
}
export declare class AnalyticsSummaryDto {
    totalPatients: number;
    appointmentsToday: number;
    totalMedicalRecords: number;
    weeklyOverview: WeeklyOverviewDto[];
}
