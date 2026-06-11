export declare class PrescriptionItemDto {
    medicineName: string;
    dosage: string;
    duration: string;
}
export declare class CreateMedicalRecordDto {
    patientId: string;
    appointmentId?: string;
    chiefComplaint: string;
    diagnosis?: string;
    vitals?: any;
    notes?: string;
    prescriptionItems?: PrescriptionItemDto[];
    prescriptionNotes?: string;
}
