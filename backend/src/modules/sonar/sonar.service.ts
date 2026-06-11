import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TenantContext } from '../../core/prisma/tenant.context';
import { CreateSonarDto } from './dto/create-sonar.dto';

@Injectable()
export class SonarService {
  constructor(private readonly prisma: PrismaService) {}

  private get tenantId(): string {
    const store = TenantContext.getStore();
    return store?.tenantId || '';
  }

  async create(createSonarDto: CreateSonarDto, tenantIdParam: string) {
    const tenantId = tenantIdParam || this.tenantId;
    return this.prisma.ultrasoundReport.create({
      data: {
        tenantId,
        patientId: createSonarDto.patientId,
        date: new Date(createSonarDto.date),
        findings: createSonarDto.findings,
        imageUrls: createSonarDto.imageUrls || [],
      },
      include: {
        patient: true,
      },
    });
  }

  async findAll(tenantIdParam: string) {
    const tenantId = tenantIdParam || this.tenantId;
    return this.prisma.ultrasoundReport.findMany({
      where: {
        tenantId,
      },
      include: {
        patient: {
          select: { fullName: true }
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string, tenantIdParam: string) {
    const tenantId = tenantIdParam || this.tenantId;
    const report = await this.prisma.ultrasoundReport.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        patient: true,
      },
    });

    if (!report) {
      throw new NotFoundException(`Ultrasound report with ID ${id} not found`);
    }

    return report;
  }
}
