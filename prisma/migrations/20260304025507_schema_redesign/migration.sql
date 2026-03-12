/*
  Warnings:

  - You are about to drop the column `chapter` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `page_number` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `textbook_name` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `chapter_id` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `page_number` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the `Chapter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentHighlight` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content_json` to the `Page` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic_id` to the `Page` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Page` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chapter" DROP CONSTRAINT "Chapter_class_id_fkey";

-- DropForeignKey
ALTER TABLE "Chapter" DROP CONSTRAINT "Chapter_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "DocumentHighlight" DROP CONSTRAINT "DocumentHighlight_document_id_fkey";

-- DropForeignKey
ALTER TABLE "DocumentHighlight" DROP CONSTRAINT "DocumentHighlight_user_id_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_chapter_id_fkey";

-- DropIndex
DROP INDEX "Document_grade_subject_chapter_page_number_idx";

-- DropIndex
DROP INDEX "Page_chapter_id_idx";

-- DropIndex
DROP INDEX "Page_chapter_id_page_number_key";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "chapter",
DROP COLUMN "content",
DROP COLUMN "grade",
DROP COLUMN "page_number",
DROP COLUMN "subject",
DROP COLUMN "textbook_name";

-- AlterTable
ALTER TABLE "Page" DROP COLUMN "chapter_id",
DROP COLUMN "page_number",
ADD COLUMN     "content_html" TEXT,
ADD COLUMN     "content_json" JSONB NOT NULL,
ADD COLUMN     "content_text" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "page_order" INTEGER,
ADD COLUMN     "topic_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Chapter";

-- DropTable
DROP TABLE "DocumentHighlight";

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "class_subject_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "order_no" INTEGER,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "order_no" INTEGER,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentTopicProgress" (
    "student_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "accuracy" DECIMAL(65,30),
    "last_activity_at" TIMESTAMP(3),

    CONSTRAINT "StudentTopicProgress_pkey" PRIMARY KEY ("student_id","school_id","topic_id")
);

-- CreateTable
CREATE TABLE "StudentPageProgress" (
    "student_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "page_id" INTEGER NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "StudentPageProgress_pkey" PRIMARY KEY ("student_id","school_id","page_id")
);

-- CreateIndex
CREATE INDEX "Book_class_subject_id_idx" ON "Book"("class_subject_id");

-- CreateIndex
CREATE INDEX "Topic_book_id_idx" ON "Topic"("book_id");

-- CreateIndex
CREATE INDEX "StudentTopicProgress_topic_id_idx" ON "StudentTopicProgress"("topic_id");

-- CreateIndex
CREATE INDEX "StudentPageProgress_page_id_idx" ON "StudentPageProgress"("page_id");

-- CreateIndex
CREATE INDEX "Page_topic_id_idx" ON "Page"("topic_id");

-- CreateIndex
CREATE INDEX "Page_is_published_idx" ON "Page"("is_published");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_class_subject_id_fkey" FOREIGN KEY ("class_subject_id") REFERENCES "ClassSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTopicProgress" ADD CONSTRAINT "StudentTopicProgress_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "User"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTopicProgress" ADD CONSTRAINT "StudentTopicProgress_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPageProgress" ADD CONSTRAINT "StudentPageProgress_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "User"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPageProgress" ADD CONSTRAINT "StudentPageProgress_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
