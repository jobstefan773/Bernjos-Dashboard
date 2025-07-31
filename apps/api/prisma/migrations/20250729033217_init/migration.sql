/*
  Warnings:

  - You are about to drop the column `name` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Position` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[posName]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `posName` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deptName` to the `Position` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Department_name_key";

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "name",
ADD COLUMN     "posName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Position" DROP COLUMN "name",
ADD COLUMN     "deptName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Department_posName_key" ON "Department"("posName");
