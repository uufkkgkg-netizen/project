import { CreateAppointmentDto } from './create-appointment.dto';
import { AppointmentStatus } from '@prisma/client';
declare const UpdateAppointmentDto_base: import("@nestjs/common").Type<Partial<CreateAppointmentDto>>;
export declare class UpdateAppointmentDto extends UpdateAppointmentDto_base {
    status?: AppointmentStatus;
    notes?: string;
}
export {};
