import { PrismaService } from '../../core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class PatientLoginDto {
    phone: string;
    fileNumber: number;
}
export declare class PatientPortalService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(dto: PatientLoginDto): Promise<{
        access_token: string;
        patient: {
            id: string;
            fullName: string;
            phone: string | null;
            tenantName: string;
        };
    }>;
    getDashboardData(patientId: string): Promise<{
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
            status: import(".prisma/client").$Enums.AppointmentStatus;
            patientId: string;
            doctorId: string;
            notes: string | null;
            appointmentDate: Date;
            durationMinutes: number;
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
            status: import(".prisma/client").$Enums.AppointmentStatus;
            patientId: string;
            doctorId: string;
            notes: string | null;
            appointmentDate: Date;
            durationMinutes: number;
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
            status: import(".prisma/client").$Enums.ReportStatus;
            patientId: string;
            doctorId: string | null;
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
