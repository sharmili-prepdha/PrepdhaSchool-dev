import { auth } from "@/auth";
import QuizFlow from "@/features/question-cards/components/question/QuizFlow";
import { redirect } from "next/navigation";
import { Role } from "../generated/prisma/enums";

type MCQPageProps = {
  searchParams: {
    topicId?: string;
  };
};

export default async function MCQPage({ searchParams }: MCQPageProps) {
  /*
  this /mcq page actually be a topic page like .../topic/[id] and the quiz flow will be a component inside it. This way we can show topic details, resources, etc. alongside the quiz. For now, we'll keep it simple and just render the quiz flow directly on the /mcq page, but in a real app we'd likely want to refactor this into a more comprehensive topic page.
  assumptions: this page will be accessed when user is logged in as a student
  */ 
  const session = await auth();
  if(!session){
    redirect("/login"); // redirect to login if not authenticated
  }
  if(session?.user?.role !== Role.student) {
    redirect("/unauthorized"); // redirect if not a student
  }

  const params = await searchParams;
  const topicId = parseInt(params.topicId ?? "1", 10); // fallback to topic 1
  // TODO: Get studentId and schoolId from session/auth
  // const studentId = "1"; // placeholder
  // const schoolId = "1"; // placeholder
  const studentId = session?.user?.userId || 1; // fallback to 1
//   const schoolId = session?.user?.schoolId || 1; // fallback to 1

  // TODO: Add error handling for invalid topicId, studentId, schoolId (e.g., non-numeric, not found in DB)
  // TODO: Add loading state while fetching session/auth data
  // TODO: right now /mcq/create pages changes not reflected in quiz flow because i haven't implemented real-time updates or refetching in quiz flow. In a real app, we'd want to ensure that changes to questions/topics are reflected in the quiz flow, either through real-time updates (e.g., WebSockets) or by refetching data when changes are made.

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 custom-scrollbar">
      <QuizFlow topicId={topicId} studentId={studentId} />
    </div>
  );
}
