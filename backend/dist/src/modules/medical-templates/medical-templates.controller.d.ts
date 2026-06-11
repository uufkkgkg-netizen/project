import { MedicalTemplatesService } from './medical-templates.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';
type TemplateCategory = 'ULTRASOUND' | 'DIAGNOSIS' | 'PRESCRIPTION' | 'FOLLOW_UP' | 'GENERAL';
export declare class MedicalTemplatesController {
    private readonly service;
    constructor(service: MedicalTemplatesService);
    findAll(category?: TemplateCategory): Promise<any>;
    findOne(id: string): Promise<any>;
    create(dto: CreateTemplateDto): Promise<any>;
    update(id: string, dto: UpdateTemplateDto): Promise<any>;
    remove(id: string): Promise<any>;
}
export {};
