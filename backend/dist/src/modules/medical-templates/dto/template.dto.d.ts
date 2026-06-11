type TemplateCategory = 'ULTRASOUND' | 'DIAGNOSIS' | 'PRESCRIPTION' | 'FOLLOW_UP' | 'GENERAL';
export declare class CreateTemplateDto {
    title: string;
    category: TemplateCategory;
    content: string;
}
export declare class UpdateTemplateDto {
    title?: string;
    category?: TemplateCategory;
    content?: string;
    isActive?: boolean;
}
export {};
