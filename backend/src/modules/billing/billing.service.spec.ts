import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { PrismaService } from '../../core/prisma/prisma.service';

const mockPrismaService = {
  invoice: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  payment: {
    create: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrismaService)),
};

describe('BillingService', () => {
  let service: BillingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: 'REQUEST',
          useValue: { user: { tenantId: 'tenant_1' } },
        },
      ],
    }).compile();

    service = await module.resolve<BillingService>(BillingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate remaining balance correctly when recording a payment', async () => {
    // Mock existing invoice
    mockPrismaService.invoice.findFirst.mockResolvedValue({
      id: 'inv_1',
      totalAmount: 500,
      finalAmount: 500,
      paidAmount: 100,
      status: 'PARTIAL',
      tenantId: 'tenant_1',
      payments: [{ id: 'p_old', amount: 100 }],
    });

    // Mock payment creation
    mockPrismaService.payment.create.mockResolvedValue({ id: 'pay_1', amount: 200 });
    
    // Mock invoice update
    mockPrismaService.invoice.update.mockResolvedValue({
      id: 'inv_1',
      totalAmount: 500,
      paidAmount: 300,
      status: 'PARTIAL',
    });

    const result = await service.recordPayment('inv_1', {
      amount: 200,
      method: 'CASH',
    });

    expect(result).toBeDefined();
    expect(mockPrismaService.payment.create).toHaveBeenCalled();
    expect(mockPrismaService.invoice.update).toHaveBeenCalled();
  });
});
