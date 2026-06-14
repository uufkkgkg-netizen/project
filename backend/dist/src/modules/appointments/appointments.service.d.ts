import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
export declare class AppointmentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get tenantId();
    create(createAppointmentDto: CreateAppointmentDto, tenantIdParam?: string): Promise<{
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
    }>;
    findAll(userRole: string, userId: string): Promise<({
        patient: {
            id: string;
            phone: string | null;
            fileNumber: number;
            fullName: string;
        };
        doctor: {
            id: string;
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
    })[]>;
    findOne(id: string, userRole: string, userId: string): Promise<{
        patient: {
            id: string;
            phone: string | null;
            fileNumber: number;
            fullName: string;
        };
        doctor: {
            id: string;
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
    }>;
    update(id: string, updateAppointmentDto: UpdateAppointmentDto, userRole: string, userId: string): Promise<{
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
    }>;
    remove(id: string, userRole: string, userId: string): Promise<{
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
    }>;
    private validateDoctorExists;
    private validateNoOverlap;
}
