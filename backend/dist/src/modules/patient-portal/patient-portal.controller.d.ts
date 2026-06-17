import { PatientPortalService, PatientLoginDto } from './patient-portal.service';
export declare class PatientPortalController {
    private readonly portalService;
    constructor(portalService: PatientPortalService);
    login(dto: PatientLoginDto): Promise<{
        access_token: string;
        patient: {
            id: string;
            fullName: string;
            phone: string | null;
            tenantName: string;
        };
    }>;
    getDashboard(req: any): Promise<{
        upcomingAppointments: ({
            doctor: {
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            patientId: string;
            doctorId: string;
            notes: string | null;
            appointmentDate: Date;
            durationMinutes: number;
            status: import(".prisma/client").$Enums.AppointmentStatus;
        })[];
        pastAppointments: ({
            doctor: {
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            patientId: string;
            doctorId: string;
            notes: string | null;
            appointmentDate: Date;
            durationMinutes: number;
            status: import(".prisma/client").$Enums.AppointmentStatus;
        })[];
        ultrasounds: ({
            doctor: {
                firstName: string;
                lastName: string;
            } | null;
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
        })[];
        prescriptions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            patientId: string;
            notes: string | null;
            medicalRecordId: string | null;
        }[];
    }>;
}
