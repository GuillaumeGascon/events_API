/*
  Warnings:

  - Added the required column `valid` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "valid" BOOLEAN NOT NULL;
