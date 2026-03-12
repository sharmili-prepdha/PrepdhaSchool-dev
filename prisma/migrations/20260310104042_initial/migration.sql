-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'teacher', 'principal', 'admin', 'superadmin');

-- CreateEnum
CREATE TYPE "ReviewQuality" AS ENUM ('again', 'hard', 'good', 'easy');

-- CreateEnum
CREATE TYPE "FlashcardScope" AS ENUM ('personal', 'ai', 'global');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'MSQ', 'TRUE_FALSE');

-- CreateTable
CREATE TABLE "School" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo_data_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_counter" INTEGER NOT NULL DEFAULT 0,

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
    "class_subject_id" INTEGER NOT NULL,

    CONSTRAINT "UserClassSubject_pkey" PRIMARY KEY ("user_id","class_subject_id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "login_id" TEXT NOT NULL,
    "email" TEXT,
    "mobile" VARCHAR(15),
    "role" "Role" NOT NULL,
    "password_hash" TEXT NOT NULL,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
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
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "current_streak" SMALLINT NOT NULL DEFAULT 0,
    "longest_streak" SMALLINT NOT NULL DEFAULT 0,
    "last_active_date" TIMESTAMPTZ,

    CONSTRAINT "StudentGamificationState_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "class_subject_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "order_no" INTEGER,
    "thumbnail_url" TEXT,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "order_no" INTEGER,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "chapter_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "order_no" INTEGER,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" SERIAL NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "page_order" INTEGER,
    "content_json" JSONB,
    "content_html" TEXT,
    "content_text" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentTopicProgress" (
    "student_id" INTEGER NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "class_subject_id" INTEGER NOT NULL,
    "accuracy" DECIMAL(65,30),
    "last_activity_at" TIMESTAMP(3),

    CONSTRAINT "StudentTopicProgress_pkey" PRIMARY KEY ("student_id","topic_id")
);

-- CreateTable
CREATE TABLE "StudentPageProgress" (
    "student_id" INTEGER NOT NULL,
    "page_id" INTEGER NOT NULL,
    "class_subject_id" INTEGER NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "StudentPageProgress_pkey" PRIMARY KEY ("student_id","page_id")
);

-- CreateTable
CREATE TABLE "PageHighlight" (
    "id" TEXT NOT NULL,
    "page_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "from_pos" INTEGER NOT NULL,
    "to_pos" INTEGER NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" SERIAL NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "student_id" INTEGER,
    "question" JSONB NOT NULL,
    "answer" JSONB NOT NULL,
    "scope" "FlashcardScope" NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentFlashcardState" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "flashcard_id" INTEGER NOT NULL,
    "repetition" INTEGER NOT NULL,
    "lapses" INTEGER NOT NULL,
    "interval_factor" INTEGER NOT NULL DEFAULT 60,
    "last_quality" "ReviewQuality" NOT NULL,
    "next_review_at" TIMESTAMP(3) NOT NULL,
    "last_reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentFlashcardState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "question_id" TEXT NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "question_type" "QuestionType" NOT NULL,
    "content" JSONB NOT NULL,
    "explanation" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "Option" (
    "option_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("option_id")
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
CREATE UNIQUE INDEX "Subject_board_id_name_key" ON "Subject"("board_id", "name");

-- CreateIndex
CREATE INDEX "ClassSubject_class_id_idx" ON "ClassSubject"("class_id");

-- CreateIndex
CREATE INDEX "ClassSubject_subject_id_idx" ON "ClassSubject"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSubject_class_id_subject_id_key" ON "ClassSubject"("class_id", "subject_id");

-- CreateIndex
CREATE INDEX "SchoolClassSubject_class_subject_id_idx" ON "SchoolClassSubject"("class_subject_id");

-- CreateIndex
CREATE INDEX "User_school_id_idx" ON "User"("school_id");

-- CreateIndex
CREATE INDEX "User_login_id_idx" ON "User"("login_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_school_id_login_id_key" ON "User"("school_id", "login_id");

-- CreateIndex
CREATE INDEX "Book_class_subject_id_idx" ON "Book"("class_subject_id");

-- CreateIndex
CREATE INDEX "Chapter_book_id_idx" ON "Chapter"("book_id");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_book_id_order_no_key" ON "Chapter"("book_id", "order_no");

-- CreateIndex
CREATE INDEX "Topic_chapter_id_idx" ON "Topic"("chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_chapter_id_order_no_key" ON "Topic"("chapter_id", "order_no");

-- CreateIndex
CREATE INDEX "Page_topic_id_page_order_idx" ON "Page"("topic_id", "page_order");

-- CreateIndex
CREATE INDEX "Page_is_published_idx" ON "Page"("is_published");

-- CreateIndex
CREATE UNIQUE INDEX "Page_topic_id_page_order_key" ON "Page"("topic_id", "page_order");

-- CreateIndex
CREATE INDEX "StudentTopicProgress_topic_id_idx" ON "StudentTopicProgress"("topic_id");

-- CreateIndex
CREATE INDEX "StudentTopicProgress_class_subject_id_idx" ON "StudentTopicProgress"("class_subject_id");

-- CreateIndex
CREATE INDEX "StudentPageProgress_page_id_idx" ON "StudentPageProgress"("page_id");

-- CreateIndex
CREATE INDEX "StudentPageProgress_class_subject_id_idx" ON "StudentPageProgress"("class_subject_id");

-- CreateIndex
CREATE INDEX "PageHighlight_page_id_student_id_idx" ON "PageHighlight"("page_id", "student_id");

-- CreateIndex
CREATE INDEX "Flashcard_topic_id_idx" ON "Flashcard"("topic_id");

-- CreateIndex
CREATE INDEX "Flashcard_student_id_idx" ON "Flashcard"("student_id");

-- CreateIndex
CREATE INDEX "StudentFlashcardState_student_id_next_review_at_idx" ON "StudentFlashcardState"("student_id", "next_review_at");

-- CreateIndex
CREATE UNIQUE INDEX "StudentFlashcardState_student_id_flashcard_id_key" ON "StudentFlashcardState"("student_id", "flashcard_id");

-- CreateIndex
CREATE INDEX "Question_topic_id_idx" ON "Question"("topic_id");

-- CreateIndex
CREATE INDEX "Question_question_type_idx" ON "Question"("question_type");

-- CreateIndex
CREATE INDEX "Option_question_id_idx" ON "Option"("question_id");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClassSubject" ADD CONSTRAINT "SchoolClassSubject_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClassSubject" ADD CONSTRAINT "SchoolClassSubject_class_subject_id_fkey" FOREIGN KEY ("class_subject_id") REFERENCES "ClassSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserClassSubject" ADD CONSTRAINT "UserClassSubject_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserClassSubject" ADD CONSTRAINT "UserClassSubject_class_subject_id_fkey" FOREIGN KEY ("class_subject_id") REFERENCES "ClassSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGamificationState" ADD CONSTRAINT "StudentGamificationState_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_class_subject_id_fkey" FOREIGN KEY ("class_subject_id") REFERENCES "ClassSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTopicProgress" ADD CONSTRAINT "StudentTopicProgress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTopicProgress" ADD CONSTRAINT "StudentTopicProgress_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPageProgress" ADD CONSTRAINT "StudentPageProgress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPageProgress" ADD CONSTRAINT "StudentPageProgress_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageHighlight" ADD CONSTRAINT "PageHighlight_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageHighlight" ADD CONSTRAINT "PageHighlight_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFlashcardState" ADD CONSTRAINT "StudentFlashcardState_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFlashcardState" ADD CONSTRAINT "StudentFlashcardState_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;
