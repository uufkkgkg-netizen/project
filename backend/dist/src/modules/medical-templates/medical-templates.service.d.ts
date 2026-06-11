import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';
type TemplateCategory = 'ULTRASOUND' | 'DIAGNOSIS' | 'PRESCRIPTION' | 'FOLLOW_UP' | 'GENERAL';
export declare class MedicalTemplatesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getStore;
    findAll(category?: TemplateCategory): Promise<any>;
    findOne(id: string): Promise<any>;
    create(dto: CreateTemplateDto): Promise<any>;
    update(id: string, dto: UpdateTemplateDto): Promise<any>;
    remove(id: string): Promise<any>;
}
export {};
