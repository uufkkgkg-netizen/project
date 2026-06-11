import { AnalyticsService } from './analytics.service';
import { AnalyticsSummaryDto } from './dto/analytics-summary.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getSummary(req: any): Promise<AnalyticsSummaryDto>;
}
