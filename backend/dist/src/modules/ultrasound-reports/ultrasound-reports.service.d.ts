import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateUltrasoundReportDto } from './dto/create-ultrasound-report.dto';
export declare class UltrasoundReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getStore;
    generateReportFromTemplate(templateId: string, patientId: string): Promise<string>;
    create(dto: CreateUltrasoundReportDto): Promise<any>;
    findAll(): Promise<any>;
    findByPatient(patientId: string): Promise<any>;
}
