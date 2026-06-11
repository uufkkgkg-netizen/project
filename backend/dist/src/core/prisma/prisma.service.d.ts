import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    get scoped(): import("@prisma/client/runtime/client").DynamicClientExtensionThis<import("@prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/client").InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }, {}>, import("@prisma/client").Prisma.TypeMapCb<import("@prisma/client").Prisma.PrismaClientOptions>, {
        result: {};
        model: {};
        query: {};
        client: {};
    }>;
    get rls(): import("@prisma/client/runtime/client").DynamicClientExtensionThis<import("@prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/client").InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }, {}>, import("@prisma/client").Prisma.TypeMapCb<import("@prisma/client").Prisma.PrismaClientOptions>, {
        result: {};
        model: {};
        query: {};
        client: {};
    }>;
}
