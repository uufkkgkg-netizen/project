/*
  Warnings:

  - Added the required column `patient_id` to the `prescriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `prescriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "prescriptions" ADD COLUMN     "patient_id" UUID NOT NULL,
ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "medical_record_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "prescriptions_tenant_id_idx" ON "prescriptions"("tenant_id");

-- CreateIndex
CREATE INDEX "prescriptions_patient_id_idx" ON "prescriptions"("patient_id");

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
