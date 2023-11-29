/*
  Warnings:

  - You are about to drop the column `for_group_chat` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `from_sessionID` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `to_sessionID` on the `Invitation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_username_fkey";

-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "for_group_chat",
DROP COLUMN "from_sessionID",
DROP COLUMN "to_sessionID",
ADD COLUMN     "from_userId" TEXT,
ADD COLUMN     "to_userId" TEXT,
ALTER COLUMN "for_game" DROP NOT NULL,
ALTER COLUMN "for_game" SET DATA TYPE TEXT,
ALTER COLUMN "to_be_friends" DROP NOT NULL,
ALTER COLUMN "to_be_friends" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "connected" DROP NOT NULL,
ALTER COLUMN "connected" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "_I_send" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_I receive" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_I_send_AB_unique" ON "_I_send"("A", "B");

-- CreateIndex
CREATE INDEX "_I_send_B_index" ON "_I_send"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_I receive_AB_unique" ON "_I receive"("A", "B");

-- CreateIndex
CREATE INDEX "_I receive_B_index" ON "_I receive"("B");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_I_send" ADD CONSTRAINT "_I_send_A_fkey" FOREIGN KEY ("A") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_I_send" ADD CONSTRAINT "_I_send_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_I receive" ADD CONSTRAINT "_I receive_A_fkey" FOREIGN KEY ("A") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_I receive" ADD CONSTRAINT "_I receive_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
