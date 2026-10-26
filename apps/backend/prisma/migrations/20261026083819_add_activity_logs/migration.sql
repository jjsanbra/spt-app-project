-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('BOOKING_CREATED', 'BOOKING_CANCELLED', 'BOOKING_MODIFIED', 'BOOKING_COMPLETED', 'FACILITY_CREATED', 'FACILITY_UPDATED', 'FACILITY_DELETED', 'FACILITY_BLOCK_CREATED', 'FACILITY_BLOCK_DELETED', 'PRICING_RULE_CREATED', 'PRICING_RULE_UPDATED', 'PRICING_RULE_DELETED', 'MEMBER_ROLE_CHANGED', 'MEMBER_WALLET_TOPUP', 'MEMBER_WALLET_ADJUSTED', 'MEMBER_STATUS_CHANGED', 'AUTH_LOGIN_SUCCESS', 'AUTH_PASSWORD_CHANGED', 'AUTH_FAILED_ATTEMPT', 'CLUB_CREATED', 'CLUB_UPDATED', 'CLUB_STATUS_TOGGLED');

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "club_id" TEXT,
    "user_id" TEXT,
    "action" "ActivityAction" NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" VARCHAR(100),
    "summary" VARCHAR(255) NOT NULL,
    "metadata" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_club_id_created_at_idx" ON "activity_logs"("club_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_club_id_entity_type_entity_id_idx" ON "activity_logs"("club_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
