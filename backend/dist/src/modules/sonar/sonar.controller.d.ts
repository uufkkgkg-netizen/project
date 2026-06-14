import { SonarService } from './sonar.service';
import { CreateSonarDto } from './dto/create-sonar.dto';
export declare class SonarController {
    private readonly sonarService;
    constructor(sonarService: SonarService);
    create(createSonarDto: CreateSonarDto, req: any): Promise<{
        patient: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            phone: string | null;
            fileNumber: number;
            fullName: string;
            dateOfBirth: Date | null;
            bloodType: string | null;
            allergies: string | null;
            medicalHistory: string | null;
            medicalNotes: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.ReportStatus;
        patientId: string;
        doctorId: string | null;
        templateId: string | null;
        date: Date;
        findings: string;
        measurements: import("@prisma/client/runtime/library").JsonValue | null;
        imageUrls: string[];
    }>;
    findAll(req: any): Promise<({
        patient: {
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.ReportStatus;
        patientId: string;
        doctorId: string | null;
        templateId: string | null;
        date: Date;
        findings: string;
        measurements: import("@prisma/client/runtime/library").JsonValue | null;
        imageUrls: string[];
    })[]>;
    findOne(id: string, req: any): Promise<{
        patient: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            phone: string | null;
            fileNumber: number;
            fullName: string;
            dateOfBirth: Date | null;
            bloodType: string | null;
            allergies: string | null;
            medicalHistory: string | null;
            medicalNotes: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.ReportStatus;
        patientId: string;
        doctorId: string | null;
        templateId: string | null;
        date: Date;
        findings: string;
        measurements: import("@prisma/client/runtime/library").JsonValue | null;
        imageUrls: string[];
    }>;
}
