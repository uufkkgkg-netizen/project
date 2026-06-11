declare class PrescriptionItemDto {
    medicineName: string;
    dosage: string;
    duration: string;
}
export declare class CreatePrescriptionDto {
    patientId: string;
    medicalRecordId?: string;
    notes?: string;
    items: PrescriptionItemDto[];
}
export {};
