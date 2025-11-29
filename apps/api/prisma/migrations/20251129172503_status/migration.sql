/*
  Warnings:

  - The `status` column on the `BstRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `employeeId` on the `LeaveRequest` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Employee` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[accountId,date]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `LeaveRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BstStatus" AS ENUM ('PENDING', 'ACCEPTED', 'RECEIVED', 'REJECTED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "BstRequest" DROP CONSTRAINT "BstRequest_managerId_fkey";

-- DropForeignKey
ALTER TABLE "BstRequest" DROP CONSTRAINT "BstRequest_requesterId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_branchId_fkey";

-- DropForeignKey
ALTER TABLE "LeaveRequest" DROP CONSTRAINT "LeaveRequest_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_employeeId_fkey";

-- DropIndex
DROP INDEX "LeaveRequest_employeeId_startDate_endDate_idx";

-- DropIndex
DROP INDEX "Schedule_employeeId_date_key";

-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_employeeId_key";

-- AlterTable
ALTER TABLE "BstRequest" ADD COLUMN     "rejectionReason" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "BstStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "LeaveRequest" DROP COLUMN "employeeId",
ADD COLUMN     "accountId" UUID NOT NULL,
ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "employeeId",
ADD COLUMN     "accountId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "employeeId",
DROP COLUMN "fullName",
ADD COLUMN     "accountId" UUID NOT NULL,
ADD COLUMN     "contactNo" TEXT,
ADD COLUMN     "username" TEXT NOT NULL;

-- DropTable
DROP TABLE "Employee";

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL,
    "code" TEXT,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "department" "Department",
    "dateHired" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "branchId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_code_key" ON "Account"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE INDEX "LeaveRequest_accountId_startDate_endDate_idx" ON "LeaveRequest"("accountId", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_accountId_date_key" ON "Schedule"("accountId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_accountId_key" ON "User"("accountId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BstRequest" ADD CONSTRAINT "BstRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BstRequest" ADD CONSTRAINT "BstRequest_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
