/*
  Warnings:

  - You are about to drop the column `book_id` on the `Topic` table. All the data in the column will be lost.
  - Added the required column `chapter_id` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_book_id_fkey";

-- DropIndex
DROP INDEX "Topic_book_id_idx";

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "book_id",
ADD COLUMN     "chapter_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Chapter" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "order_no" INTEGER,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chapter_book_id_idx" ON "Chapter"("book_id");

-- CreateIndex
CREATE INDEX "Topic_chapter_id_idx" ON "Topic"("chapter_id");

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
