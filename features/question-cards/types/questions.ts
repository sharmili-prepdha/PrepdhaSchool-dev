import { Prisma } from "@/app/generated/prisma/client";

export type QuestionWithOptions = Prisma.QuestionGetPayload<{
  include: { options: true };
}>;
