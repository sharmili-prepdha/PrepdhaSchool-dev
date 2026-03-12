import OptionsList from "./OptionsList";
import JsonRenderer from "./JsonRendered";
import { QuestionWithOptions } from "../../types/questions";
import { JSONContent } from "@tiptap/core";


interface QuestionCardProps {
  question: QuestionWithOptions;
  savedAnswer?: {
    selectedIds: string[];
    isCorrect: boolean;
    submitted: boolean;
  };
  onSubmitAnswer: (
    questionId: string,
    selectedIds: string[],
    isCorrect: boolean
  ) => void;
  onShowExplanation: () => void;
}

export default function QuestionCard({
  question,
  savedAnswer,
  onSubmitAnswer,
  onShowExplanation,
}: QuestionCardProps) {
  // const [showExplanation, setShowExplanation] = useState(false);

  return (
    <>
      <div className="max-w-xl w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm border-b-5">

        {/* Question Type Badge */}
        <div className="mb-4">
          <span className="hidden lg:inline-block px-4 py-1 text-sm font-medium bg-[#7C31F6] text-white rounded-full">
            {question.type === "MCQ" && "MCQ - Multiple Choice Question" }
            {question.type === "MSQ" && "MSQ - Multiple Select Question" }
            {question.type === "TRUE_FALSE" && "TRUE_FALSE" }
          </span>
          <span className="inline-block lg:hidden px-4 py-1 text-sm font-medium bg-[#7C31F6] text-white rounded-full">
            {question.type === "MCQ" && "Multiple Choice Question" }
            {question.type === "MSQ" && "Multiple Select Question" }
            {question.type === "TRUE_FALSE" && "TRUE_FALSE" }
          </span>
        </div>

        {/* Question Box */}
        <div className="bg-green-600 text-white rounded-xl p-6 mb-6">
          <div className={`text-lg font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1`}>
            <JsonRenderer content={question.content as JSONContent} />
          </div>
          <p className="mt-2 text-md opacity-90 flex gap-1 items-center justify-start">
            {/* <span><ArrowBigDownDash size={19} /></span> */}
            {question.type === "MCQ" && "Select one answer" }
            {question.type === "MSQ" && "Select all that apply" }
            {question.type === "TRUE_FALSE" && "Select true or false" }
          </p>
        </div>

        {/* Options */}
        <OptionsList
          questionId={question.id}
          questionType={question.type}
          options={question.options}
          explanation={question.explanation}
          savedAnswer={savedAnswer}
          onSubmitAnswer={onSubmitAnswer}
          onShowExplanation={onShowExplanation}
        />
      </div>
    </>
  );
}