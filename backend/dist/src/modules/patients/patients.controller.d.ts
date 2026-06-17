import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateVisitDto } from './dto/create-visit.dto';
export declare class PatientsController {
    private readonly patientsService;
    constructor(patientsService: PatientsService);
    create(createPatientDto: CreatePatientDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updatePatientDto: UpdatePatientDto): Promise<any>;
    createVisit(id: string, createVisitDto: CreateVisitDto): Promise<any>;
    findAllVisits(search?: string, page?: string, limit?: string): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
    }>;
}
