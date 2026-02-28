-- AlterTable
ALTER TABLE "EventType" ADD COLUMN     "maxBookingsPerWeek" INTEGER,
ADD COLUMN     "maximumNoticeDays" INTEGER NOT NULL DEFAULT 14,
ADD COLUMN     "minimumNoticeHours" INTEGER NOT NULL DEFAULT 24;
