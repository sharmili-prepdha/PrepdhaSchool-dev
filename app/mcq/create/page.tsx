import { getQuestionsByTopicId } from "@/features/question-cards/actions/questoin.actions";
import { QuestionBuilder } from "@/features/question-cards/components/question-builder/QuestionBuilder";
import type { Question } from "@/features/question-cards/components/question-builder/types";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Role } from "@/app/generated/prisma/enums";

interface PageProps {
  searchParams: Promise<{ topicId?: string }>;
}

export default async function CreateQuestionPage({ searchParams }: PageProps) {
  const session = await auth();
  // not logged in
  if(!session) {
    redirect('/login');
  }
  // not superadmin
  if(session.user.role !== Role.superadmin){
    redirect('/unauthorized');
  }
  const params = await searchParams;
  const topicId = params.topicId ? parseInt(params.topicId, 10) : null;

  if (!topicId) {
    return (
      <div className="flex items-center justify-center h-screen text-sm text-gray-500">
        No topic selected. Add <code>?topicId=your-id</code> to the URL.
      </div>
    );
  }

  const questions = await getQuestionsByTopicId(topicId as number);

  return (
    <QuestionBuilder topicId={topicId} initialQuestions={questions as unknown as Question[]} />
  );
}
