import { PrismaService } from '../../core/prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateVisitDto } from './dto/create-visit.dto';
export declare class PatientsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getStore;
    create(createPatientDto: CreatePatientDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updatePatientDto: UpdatePatientDto): Promise<any>;
    createVisit(patientId: string, createVisitDto: CreateVisitDto): Promise<any>;
}
