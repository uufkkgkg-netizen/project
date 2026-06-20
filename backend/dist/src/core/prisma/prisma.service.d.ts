import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    get scoped(): import("@prisma/client/runtime/library").DynamicClientExtensionThis<import(".prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
        result: {
            patient: {
                nationalId: () => {
                    needs: {
                        nationalId: true;
                    };
                    compute(patient: {
                        nationalId: string | null;
                    }): string | null;
                };
                medicalNotes: () => {
                    needs: {
                        medicalNotes: true;
                    };
                    compute(patient: {
                        medicalNotes: string | null;
                    }): string | null;
                };
                medicalHistory: () => {
                    needs: {
                        medicalHistory: true;
                    };
                    compute(patient: {
                        medicalHistory: string | null;
                    }): string | null;
                };
            };
        };
        model: {};
        query: {};
        client: {};
    }, import(".prisma/client").Prisma.PrismaClientOptions>, import(".prisma/client").Prisma.TypeMapCb, {
        result: {
            patient: {
                nationalId: () => {
                    needs: {
                        nationalId: true;
                    };
                    compute(patient: {
                        nationalId: string | null;
                    }): string | null;
                };
                medicalNotes: () => {
                    needs: {
                        medicalNotes: true;
                    };
                    compute(patient: {
                        medicalNotes: string | null;
                    }): string | null;
                };
                medicalHistory: () => {
                    needs: {
                        medicalHistory: true;
                    };
                    compute(patient: {
                        medicalHistory: string | null;
                    }): string | null;
                };
            };
        };
        model: {};
        query: {};
        client: {};
    }, {}>;
    get rls(): import("@prisma/client/runtime/library").DynamicClientExtensionThis<import(".prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }, import(".prisma/client").Prisma.PrismaClientOptions>, import(".prisma/client").Prisma.TypeMapCb, {
        result: {};
        model: {};
        query: {};
        client: {};
    }, {}>;
}
