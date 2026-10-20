-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SportType" ADD VALUE 'FUTSAL';
ALTER TYPE "SportType" ADD VALUE 'PICKLEBALL';
ALTER TYPE "SportType" ADD VALUE 'SQUASH';
ALTER TYPE "SportType" ADD VALUE 'BADMINTON';
ALTER TYPE "SportType" ADD VALUE 'VOLLEYBALL';
ALTER TYPE "SportType" ADD VALUE 'BEACH_VOLLEY';
ALTER TYPE "SportType" ADD VALUE 'FRONTON';
ALTER TYPE "SportType" ADD VALUE 'INDOOR_FRONTON';
ALTER TYPE "SportType" ADD VALUE 'HANDBALL';
ALTER TYPE "SportType" ADD VALUE 'TABLE_TENNIS';
ALTER TYPE "SportType" ADD VALUE 'ATHLETICS_TRACK';
ALTER TYPE "SportType" ADD VALUE 'SWIMMING_LANE';
ALTER TYPE "SportType" ADD VALUE 'CLIMBING_WALL';
