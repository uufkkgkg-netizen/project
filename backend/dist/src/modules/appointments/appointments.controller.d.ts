import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    create(createAppointmentDto: CreateAppointmentDto, req: any): Promise<{
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
    findAll(req: any): Promise<({
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
    findOne(id: string, req: any): Promise<{
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
    update(id: string, updateAppointmentDto: UpdateAppointmentDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
}
