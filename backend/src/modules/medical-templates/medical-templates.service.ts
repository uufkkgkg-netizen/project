import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TenantContext } from '../../core/prisma/tenant.context';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';

// Mirror enum locally — Prisma regeneration will validate real values at DB level
type TemplateCategory = 'ULTRASOUND' | 'DIAGNOSIS' | 'PRESCRIPTION' | 'FOLLOW_UP' | 'GENERAL';

@Injectable()
export class MedicalTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers ─────────────────────────────────────────────────────────
  private getStore() {
    const store = TenantContext.getStore();
    return {
      tenantId:     store?.tenantId     ?? null,
      userId:       store?.userId       ?? null,
      isSuperAdmin: store?.isSuperAdmin ?? false,
    };
  }

  // ── CRUD ─────────────────────────────────────────────────────────────

  async findAll(category?: TemplateCategory) {
    const db = this.prisma.scoped as any;
    return db.medicalTemplate.findMany({
      where:   category ? { category, isActive: true } : { isActive: true },
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
      select: {
        id: true, title: true, category: true,
        content: true, isActive: true,
        createdAt: true, updatedAt: true,
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const db = this.prisma.scoped as any;
    const template = await db.medicalTemplate.findFirst({
      where: { id },
      include: { creator: { select: { id: true, firstName: true, lastName: true } } }
    });
    if (!template) throw new NotFoundException('القالب غير موجود');
    return template;
  }

  async create(dto: CreateTemplateDto) {
    const { tenantId, userId, isSuperAdmin } = this.getStore();

    if (!tenantId && !isSuperAdmin) {
      throw new ForbiddenException('لا يمكن إنشاء قالب بدون عيادة محددة');
    }

    const db = this.prisma as any;
    return db.medicalTemplate.create({
      data: {
        tenantId:  tenantId!,
        title:     dto.title,
        category:  dto.category,
        content:   dto.content,
        createdBy: userId ?? undefined,
      },
    });
  }

  async update(id: string, dto: UpdateTemplateDto) {
    await this.findOne(id); // ensures ownership via scoped (tenantId injected)
    const db = this.prisma.scoped as any;
    return db.medicalTemplate.update({
      where: { id },
      data:  dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    const db = this.prisma.scoped as any;
    // Soft delete — mark as inactive
    return db.medicalTemplate.update({
      where: { id },
      data:  { isActive: false },
    });
  }
}
