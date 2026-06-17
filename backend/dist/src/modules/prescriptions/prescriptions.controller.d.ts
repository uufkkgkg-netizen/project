import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
export declare class PrescriptionsController {
    private readonly prescriptionsService;
    constructor(prescriptionsService: PrescriptionsService);
    create(createPrescriptionDto: CreatePrescriptionDto, req: any): Promise<{
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
    findAll(req: any): Promise<({
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
    findAllByPatient(patientId: string, req: any): Promise<({
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
        medicalRecord: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            patientId: string;
            chiefComplaint: string;
            diagnosis: string | null;
            vitals: import("@prisma/client/runtime/library").JsonValue | null;
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
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        patientId: string;
        notes: string | null;
        medicalRecordId: string | null;
    }>;
}
