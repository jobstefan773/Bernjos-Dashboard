/*
  Warnings:

  - You are about to drop the column `posName` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `deptName` on the `Position` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[deptName]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deptName` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posName` to the `Position` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Department_posName_key";

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "posName",
ADD COLUMN     "deptName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Position" DROP COLUMN "deptName",
ADD COLUMN     "posName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Department_deptName_key" ON "Department"("deptName");
