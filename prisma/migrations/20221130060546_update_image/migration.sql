/*
  Warnings:

  - Added the required column `contentType` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "contentType" TEXT NOT NULL,
ADD COLUMN     "data" BYTEA NOT NULL;
