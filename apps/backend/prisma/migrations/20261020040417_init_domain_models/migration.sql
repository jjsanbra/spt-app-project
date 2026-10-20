-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('PRESENTIAL', 'ONLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "ClubRole" AS ENUM ('OWNER', 'ADMIN', 'STAFF', 'MEMBER', 'GUEST');

-- CreateEnum
CREATE TYPE "SportType" AS ENUM ('PADEL', 'TENNIS', 'FOOTBALL_7', 'FOOTBALL_11', 'BASKETBALL', 'MULTI_SPORT');

-- CreateEnum
CREATE TYPE "CourtType" AS ENUM ('INDOOR', 'OUTDOOR', 'COVERED');

-- CreateEnum
CREATE TYPE "SurfaceType" AS ENUM ('CRYSTAL', 'CLAY', 'SYNTHETIC_GRASS', 'CONCRETE', 'PARQUET', 'RESIN');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('FULL', 'OPEN');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('REGISTERED', 'CONFIRMED', 'CANCELLED', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PRESENTIAL_CASH', 'PRESENTIAL_POS', 'WALLET', 'STRIPE', 'REDSYS');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'OPEN_GAME_JOINED', 'OPEN_GAME_COMPLETE', 'PAYMENT_RECEIVED', 'SYSTEM');

-- CreateTable
CREATE TABLE "clubs" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(50),
    "address" VARCHAR(255),
    "city" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "opening_hour" INTEGER NOT NULL DEFAULT 8,
    "closing_hour" INTEGER NOT NULL DEFAULT 23,
    "slot_duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "open_game_min_notice_hours" INTEGER NOT NULL DEFAULT 2,
    "payment_mode" "PaymentMode" NOT NULL DEFAULT 'PRESENTIAL',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(50),
    "avatar_url" VARCHAR(500),
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_memberships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "role" "ClubRole" NOT NULL DEFAULT 'MEMBER',
    "wallet_balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "member_number" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "sport_type" "SportType" NOT NULL,
    "court_type" "CourtType" NOT NULL DEFAULT 'OUTDOOR',
    "surface_type" "SurfaceType" NOT NULL DEFAULT 'SYNTHETIC_GRASS',
    "has_lighting" BOOLEAN NOT NULL DEFAULT true,
    "default_slot_minutes" INTEGER NOT NULL DEFAULT 90,
    "min_players" INTEGER NOT NULL DEFAULT 4,
    "max_players" INTEGER NOT NULL DEFAULT 4,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_blocks" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "reason" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facility_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "facility_id" TEXT,
    "sport_type" "SportType",
    "name" VARCHAR(100) NOT NULL,
    "is_peak_hour" BOOLEAN NOT NULL DEFAULT false,
    "start_time" VARCHAR(10),
    "end_time" VARCHAR(10),
    "days_of_week" INTEGER[],
    "member_price" DECIMAL(10,2) NOT NULL,
    "guest_price" DECIMAL(10,2) NOT NULL,
    "light_surcharge" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "booking_type" "BookingType" NOT NULL DEFAULT 'FULL',
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "light_included" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "cancellation_reason" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_participants" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "user_id" TEXT,
    "guest_name" VARCHAR(100),
    "is_host" BOOLEAN NOT NULL DEFAULT false,
    "slot_number" INTEGER NOT NULL,
    "team" VARCHAR(50),
    "individual_price" DECIMAL(10,2) NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'REGISTERED',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "user_id" TEXT,
    "participant_id" TEXT,
    "processed_by_user_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'PRESENTIAL_CASH',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "external_reference" VARCHAR(150),
    "notes" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "club_id" TEXT,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clubs_slug_key" ON "clubs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "club_memberships_club_id_role_idx" ON "club_memberships"("club_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "club_memberships_user_id_club_id_key" ON "club_memberships"("user_id", "club_id");

-- CreateIndex
CREATE INDEX "facilities_club_id_sport_type_idx" ON "facilities"("club_id", "sport_type");

-- CreateIndex
CREATE INDEX "facility_blocks_club_id_facility_id_start_time_end_time_idx" ON "facility_blocks"("club_id", "facility_id", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "pricing_rules_club_id_facility_id_idx" ON "pricing_rules"("club_id", "facility_id");

-- CreateIndex
CREATE INDEX "bookings_club_id_facility_id_start_time_end_time_idx" ON "bookings"("club_id", "facility_id", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "bookings_club_id_status_idx" ON "bookings"("club_id", "status");

-- CreateIndex
CREATE INDEX "booking_participants_booking_id_user_id_idx" ON "booking_participants"("booking_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_participants_booking_id_slot_number_key" ON "booking_participants"("booking_id", "slot_number");

-- CreateIndex
CREATE INDEX "payments_club_id_booking_id_idx" ON "payments"("club_id", "booking_id");

-- CreateIndex
CREATE INDEX "payments_club_id_status_idx" ON "payments"("club_id", "status");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- AddForeignKey
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_blocks" ADD CONSTRAINT "facility_blocks_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_blocks" ADD CONSTRAINT "facility_blocks_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "booking_participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_processed_by_user_id_fkey" FOREIGN KEY ("processed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
