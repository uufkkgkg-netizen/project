export declare class CreateUltrasoundReportDto {
    patientId: string;
    templateId?: string;
    findings: string;
    measurements?: Record<string, any>;
    imageUrls?: string[];
}
