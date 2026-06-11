import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
export declare class MedicalRecordsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get tenantId();
    create(createDto: CreateMedicalRecordDto, tenantIdParam: string): Promise<({
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
        prescription: ({
            items: {
                id: string;
                createdAt: Date;
                prescriptionId: string;
                medicineName: string;
                dosage: string;
                duration: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            patientId: string;
            notes: string | null;
            medicalRecordId: string | null;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        patientId: string;
        chiefComplaint: string;
        diagnosis: string | null;
        vitals: import("@prisma/client/runtime/client").JsonValue | null;
        notes: string | null;
        appointmentId: string | null;
    }) | null>;
    findAllByPatient(patientId: string): Promise<({
        prescription: ({
            items: {
                id: string;
                createdAt: Date;
                prescriptionId: string;
                medicineName: string;
                dosage: string;
                duration: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            patientId: string;
            notes: string | null;
            medicalRecordId: string | null;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        patientId: string;
        chiefComplaint: string;
        diagnosis: string | null;
        vitals: import("@prisma/client/runtime/client").JsonValue | null;
        notes: string | null;
        appointmentId: string | null;
    })[]>;
    findOne(id: string): Promise<{
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
        prescription: ({
            items: {
                id: string;
                createdAt: Date;
                prescriptionId: string;
                medicineName: string;
                dosage: string;
                duration: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            patientId: string;
            notes: string | null;
            medicalRecordId: string | null;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        patientId: string;
        chiefComplaint: string;
        diagnosis: string | null;
        vitals: import("@prisma/client/runtime/client").JsonValue | null;
        notes: string | null;
        appointmentId: string | null;
    }>;
}
