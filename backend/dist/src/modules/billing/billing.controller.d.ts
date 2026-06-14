import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-billing.dto';
import { RecordPaymentDto } from './dto/update-billing.dto';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    create(dto: CreateInvoiceDto, req: any): Promise<{
        payments: {
            id: string;
            createdAt: Date;
            tenantId: string;
            notes: string | null;
            invoiceId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            paymentDate: Date;
        }[];
        patient: {
            id: string;
            phone: string | null;
            fileNumber: number;
            fullName: string;
        };
        items: {
            id: string;
            createdAt: Date;
            invoiceId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        patientId: string;
        notes: string | null;
        appointmentId: string | null;
        medicalRecordId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        finalAmount: import("@prisma/client/runtime/library").Decimal;
        issueDate: Date;
    }>;
    findAll(): Promise<({
        payments: {
            id: string;
            createdAt: Date;
            tenantId: string;
            notes: string | null;
            invoiceId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            paymentDate: Date;
        }[];
        patient: {
            id: string;
            fileNumber: number;
            fullName: string;
        };
        items: {
            id: string;
            createdAt: Date;
            invoiceId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        patientId: string;
        notes: string | null;
        appointmentId: string | null;
        medicalRecordId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        finalAmount: import("@prisma/client/runtime/library").Decimal;
        issueDate: Date;
    })[]>;
    getSummary(): Promise<{
        totalInvoiced: number;
        totalInvoices: number;
        totalCollected: number;
        paidCount: number;
        unpaidAmount: number;
        unpaidCount: number;
        partialCount: number;
    }>;
    findByPatient(patientId: string): Promise<({
        payments: {
            id: string;
            createdAt: Date;
            tenantId: string;
            notes: string | null;
            invoiceId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            paymentDate: Date;
        }[];
        items: {
            id: string;
            createdAt: Date;
            invoiceId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        patientId: string;
        notes: string | null;
        appointmentId: string | null;
        medicalRecordId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        finalAmount: import("@prisma/client/runtime/library").Decimal;
        issueDate: Date;
    })[]>;
    findOne(id: string): Promise<{
        payments: {
            id: string;
            createdAt: Date;
            tenantId: string;
            notes: string | null;
            invoiceId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            paymentDate: Date;
        }[];
        patient: {
            id: string;
            phone: string | null;
            fileNumber: number;
            fullName: string;
        };
        appointment: {
            id: string;
            appointmentDate: Date;
        } | null;
        items: {
            id: string;
            createdAt: Date;
            invoiceId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        patientId: string;
        notes: string | null;
        appointmentId: string | null;
        medicalRecordId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        finalAmount: import("@prisma/client/runtime/library").Decimal;
        issueDate: Date;
    }>;
    recordPayment(id: string, dto: RecordPaymentDto): Promise<{
        payments: {
            id: string;
            createdAt: Date;
            tenantId: string;
            notes: string | null;
            invoiceId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            paymentDate: Date;
        }[];
        patient: {
            id: string;
            phone: string | null;
            fileNumber: number;
            fullName: string;
        };
        items: {
            id: string;
            createdAt: Date;
            invoiceId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        patientId: string;
        notes: string | null;
        appointmentId: string | null;
        medicalRecordId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        finalAmount: import("@prisma/client/runtime/library").Decimal;
        issueDate: Date;
    }>;
    cancel(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        patientId: string;
        notes: string | null;
        appointmentId: string | null;
        medicalRecordId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        finalAmount: import("@prisma/client/runtime/library").Decimal;
        issueDate: Date;
    }>;
}
