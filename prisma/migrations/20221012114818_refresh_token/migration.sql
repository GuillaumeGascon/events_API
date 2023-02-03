-- AlterTable
ALTER TABLE "users" ADD COLUMN     "salt" TEXT,
ALTER COLUMN "userName" DROP NOT NULL;
