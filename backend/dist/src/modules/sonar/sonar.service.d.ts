import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateSonarDto } from './dto/create-sonar.dto';
export declare class SonarService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get tenantId();
    create(createSonarDto: CreateSonarDto, tenantIdParam: string): Promise<{
        patient: {
            id: string;
            address: string | null;
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
            nationalId: string | null;
            maritalStatus: string | null;
            husbandName: string | null;
            emergencyContactName: string | null;
            emergencyContactPhone: string | null;
            gravida: number | null;
            para: number | null;
            abortus: number | null;
            livingChildren: number | null;
            lastMenstrualPeriod: Date | null;
            estimatedDueDate: Date | null;
            gestationalAge: string | null;
            contraceptiveMethod: string | null;
            previousSurgeries: string | null;
            chronicDiseases: string | null;
            familyHistory: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        patientId: string;
        doctorId: string | null;
        status: import(".prisma/client").$Enums.ReportStatus;
        templateId: string | null;
        date: Date;
        findings: string;
        measurements: import("@prisma/client/runtime/library").JsonValue | null;
        imageUrls: string[];
    }>;
    findAll(tenantIdParam: string): Promise<({
        patient: {
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        patientId: string;
        doctorId: string | null;
        status: import(".prisma/client").$Enums.ReportStatus;
        templateId: string | null;
        date: Date;
        findings: string;
        measurements: import("@prisma/client/runtime/library").JsonValue | null;
        imageUrls: string[];
    })[]>;
    findOne(id: string, tenantIdParam: string): Promise<{
        patient: {
            id: string;
            address: string | null;
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
            nationalId: string | null;
            maritalStatus: string | null;
            husbandName: string | null;
            emergencyContactName: string | null;
            emergencyContactPhone: string | null;
            gravida: number | null;
            para: number | null;
            abortus: number | null;
            livingChildren: number | null;
            lastMenstrualPeriod: Date | null;
            estimatedDueDate: Date | null;
            gestationalAge: string | null;
            contraceptiveMethod: string | null;
            previousSurgeries: string | null;
            chronicDiseases: string | null;
            familyHistory: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        patientId: string;
        doctorId: string | null;
        status: import(".prisma/client").$Enums.ReportStatus;
        templateId: string | null;
        date: Date;
        findings: string;
        measurements: import("@prisma/client/runtime/library").JsonValue | null;
        imageUrls: string[];
    }>;
}
