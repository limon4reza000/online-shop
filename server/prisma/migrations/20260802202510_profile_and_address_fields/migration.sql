/*
  Warnings:

  - You are about to drop the column `city` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `line1` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `address` table. All the data in the column will be lost.
  - Added the required column `district` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `division` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullAddress` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `upazila` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `address` DROP COLUMN `city`,
    DROP COLUMN `country`,
    DROP COLUMN `line1`,
    DROP COLUMN `zip`,
    ADD COLUMN `district` VARCHAR(191) NOT NULL,
    ADD COLUMN `division` VARCHAR(191) NOT NULL,
    ADD COLUMN `fullAddress` VARCHAR(191) NOT NULL,
    ADD COLUMN `postalCode` VARCHAR(191) NOT NULL,
    ADD COLUMN `upazila` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `dateOfBirth` DATETIME(3) NULL,
    ADD COLUMN `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL;

-- RedefineIndex
CREATE INDEX `Address_userId_idx` ON `Address`(`userId`);

