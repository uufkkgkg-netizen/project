import { UltrasoundReportsService } from './ultrasound-reports.service';
import { CreateUltrasoundReportDto } from './dto/create-ultrasound-report.dto';
export declare class UltrasoundReportsController {
    private readonly reportsService;
    constructor(reportsService: UltrasoundReportsService);
    create(dto: CreateUltrasoundReportDto): Promise<any>;
    findAll(): Promise<any>;
    findByPatient(patientId: string): Promise<any>;
    generatePreview(templateId: string, patientId: string): Promise<string>;
}
