import { PrismaService } from '../../core/prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
export declare class PrescriptionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get tenantId();
    create(createPrescriptionDto: CreatePrescriptionDto, tenantIdParam: string): Promise<{
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
    }>;
    findAll(tenantIdParam: string): Promise<({
        patient: {
            fullName: string;
        };
        medicalRecord: {
            diagnosis: string | null;
        } | null;
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
    })[]>;
    findAllByPatient(patientId: string, tenantIdParam: string): Promise<({
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
        medicalRecord: {
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
        } | null;
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
    })[]>;
    findOne(id: string, tenantIdParam: string): Promise<{
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
    }>;
    remove(id: string, tenantIdParam: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        patientId: string;
        notes: string | null;
        medicalRecordId: string | null;
    }>;
}
