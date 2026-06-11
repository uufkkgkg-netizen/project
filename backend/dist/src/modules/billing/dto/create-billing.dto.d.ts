export declare class InvoiceItemDto {
    description: string;
    amount: number;
}
export declare class CreateInvoiceDto {
    patientId: string;
    appointmentId?: string;
    medicalRecordId?: string;
    items: InvoiceItemDto[];
    discount?: number;
    tax?: number;
    notes?: string;
}
