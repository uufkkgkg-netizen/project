import { PrismaService } from '../../core/prisma/prisma.service';
import { AnalyticsSummaryDto } from './dto/analytics-summary.dto';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get tenantId();
    getSummary(tenantIdParam: string): Promise<AnalyticsSummaryDto>;
}
