-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "date_of_birth" DATE,
    "phone" VARCHAR(20),
    "blood_type" VARCHAR(5),
    "medical_notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "patients_tenant_id_idx" ON "patients"("tenant_id");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
