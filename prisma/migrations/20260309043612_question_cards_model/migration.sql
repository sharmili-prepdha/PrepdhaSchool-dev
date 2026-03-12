-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'MSQ', 'TRUE_FALSE');

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
CREATE INDEX "Question_topic_id_idx" ON "Question"("topic_id");

-- CreateIndex
CREATE INDEX "Question_question_type_idx" ON "Question"("question_type");

-- CreateIndex
CREATE INDEX "Option_question_id_idx" ON "Option"("question_id");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;
