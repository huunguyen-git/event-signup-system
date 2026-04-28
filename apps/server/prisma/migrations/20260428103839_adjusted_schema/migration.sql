/*
  Warnings:

  - You are about to drop the column `venue_details` on the `events` table. All the data in the column will be lost.
  - Added the required column `birthdate` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "venue_details",
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "location_url" TEXT;

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "birthdate" DATE NOT NULL,
ADD COLUMN     "phone_number" TEXT;
