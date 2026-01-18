/*
  Warnings:

  - You are about to drop the column `address` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Shop` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "address",
DROP COLUMN "description",
DROP COLUMN "email",
DROP COLUMN "phone",
DROP COLUMN "website";
