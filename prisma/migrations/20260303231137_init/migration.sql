-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'teacher', 'principal', 'admin', 'superadmin');

-- CreateTable
CREATE TABLE "School" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo_data_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Board" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" SMALLINT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "board_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" SERIAL NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "class_id" SMALLINT NOT NULL,
    "name" TEXT,
    "sort_order" INTEGER,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" SERIAL NOT NULL,
    "chapter_id" INTEGER NOT NULL,
    "page_number" INTEGER NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "content" JSONB NOT NULL,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSubject" (
    "id" SERIAL NOT NULL,
    "class_id" SMALLINT NOT NULL,
    "subject_id" INTEGER NOT NULL,

    CONSTRAINT "ClassSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolClassSubject" (
    "school_id" INTEGER NOT NULL,
    "class_subject_id" INTEGER NOT NULL,

    CONSTRAINT "SchoolClassSubject_pkey" PRIMARY KEY ("school_id","class_subject_id")
);

-- CreateTable
CREATE TABLE "UserClassSubject" (
    "user_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "class_subject_id" INTEGER NOT NULL,

    CONSTRAINT "UserClassSubject_pkey" PRIMARY KEY ("user_id","school_id","class_subject_id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "mobile" VARCHAR(15),
    "role" "Role" NOT NULL,
    "password_hash" TEXT NOT NULL,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id","school_id")
);

-- CreateTable
CREATE TABLE "XpRule" (
    "activity_type" TEXT NOT NULL,
    "activity_displayname" TEXT NOT NULL,
    "xp_points" INTEGER NOT NULL,

    CONSTRAINT "XpRule_pkey" PRIMARY KEY ("activity_type")
);

-- CreateTable
CREATE TABLE "StudentGamificationState" (
    "student_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "current_streak" SMALLINT NOT NULL DEFAULT 0,
    "longest_streak" SMALLINT NOT NULL DEFAULT 0,
    "last_active_date" TIMESTAMPTZ,

    CONSTRAINT "StudentGamificationState_pkey" PRIMARY KEY ("student_id","school_id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "school_id" INTEGER,
    "title" TEXT,
    "grade" INTEGER,
    "subject" TEXT,
    "textbook_name" TEXT,
    "chapter" TEXT,
    "page_number" INTEGER,
    "content" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentHighlight" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "from_pos" INTEGER NOT NULL,
    "to_pos" INTEGER NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "School_keyword_key" ON "School"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "Board_name_key" ON "Board"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_key" ON "Class"("name");

-- CreateIndex
CREATE INDEX "Subject_board_id_idx" ON "Subject"("board_id");

-- CreateIndex
CREATE INDEX "Chapter_subject_id_class_id_idx" ON "Chapter"("subject_id", "class_id");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_subject_id_class_id_name_key" ON "Chapter"("subject_id", "class_id", "name");

-- CreateIndex
CREATE INDEX "Page_chapter_id_idx" ON "Page"("chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "Page_chapter_id_page_number_key" ON "Page"("chapter_id", "page_number");

-- CreateIndex
CREATE INDEX "DocumentChunk_document_id_idx" ON "DocumentChunk"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentChunk_document_id_chunk_index_key" ON "DocumentChunk"("document_id", "chunk_index");

-- CreateIndex
CREATE INDEX "User_school_id_idx" ON "User"("school_id");

-- CreateIndex
CREATE INDEX "StudentGamificationState_school_id_idx" ON "StudentGamificationState"("school_id");

-- CreateIndex
CREATE INDEX "Document_school_id_idx" ON "Document"("school_id");

-- CreateIndex
CREATE INDEX "Document_grade_subject_chapter_page_number_idx" ON "Document"("grade", "subject", "chapter", "page_number");

-- CreateIndex
CREATE INDEX "DocumentHighlight_document_id_user_id_school_id_idx" ON "DocumentHighlight"("document_id", "user_id", "school_id");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClassSubject" ADD CONSTRAINT "SchoolClassSubject_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClassSubject" ADD CONSTRAINT "SchoolClassSubject_class_subject_id_fkey" FOREIGN KEY ("class_subject_id") REFERENCES "ClassSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserClassSubject" ADD CONSTRAINT "UserClassSubject_user_id_school_id_fkey" FOREIGN KEY ("user_id", "school_id") REFERENCES "User"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserClassSubject" ADD CONSTRAINT "UserClassSubject_class_subject_id_fkey" FOREIGN KEY ("class_subject_id") REFERENCES "ClassSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGamificationState" ADD CONSTRAINT "StudentGamificationState_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "User"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentHighlight" ADD CONSTRAINT "DocumentHighlight_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentHighlight" ADD CONSTRAINT "DocumentHighlight_user_id_school_id_fkey" FOREIGN KEY ("user_id", "school_id") REFERENCES "User"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;
