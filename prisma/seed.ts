import { PrismaClient } from "@/app/generated/prisma/client";
import { FlashcardScope, QuestionType, Role } from "@/app/generated/prisma/enums";
import { logger } from "@/lib/logger";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../lib/password";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  logger.info("Starting seed...");

  // ─── 1. BOARD ───────────────────────────────────────────────────────────────
  const board = await prisma.board.upsert({
    where: { name: "NCERT" },
    update: {},
    create: { name: "NCERT" },
  });
  logger.info(`Board: ${board.name}`);

  // ─── 2. SUBJECTS ────────────────────────────────────────────────────────────
  const subjectNames = ["Mathematics", "Science", "Social Studies", "English", "Hindi"];
  const subjectMap: Record<string, number> = {};
  for (const name of subjectNames) {
    let s = await prisma.subject.findFirst({ where: { name, board_id: board.id } });
    if (!s) s = await prisma.subject.create({ data: { name, board_id: board.id } });
    subjectMap[name] = s.id;
  }
  logger.info(`Subjects seeded: ${Object.keys(subjectMap).join(", ")}`);

  // ─── 3. CLASSES ─────────────────────────────────────────────────────────────
  const classData = [
    { id: 6, name: "6th" }, { id: 7, name: "7th" }, { id: 8, name: "8th" },
    { id: 9, name: "9th" }, { id: 10, name: "10th" },
  ];
  for (const cls of classData) {
    await prisma.class.upsert({ where: { id: cls.id }, update: {}, create: cls });
  }
  logger.info(`Classes seeded: ${classData.map((c) => c.name).join(", ")}`);

  // ─── 4. CLASS SUBJECTS ───────────────────────────────────────────────────────
  const classSubjectMap: Record<string, number> = {};
  for (const cls of classData) {
    for (const [subName, subId] of Object.entries(subjectMap)) {
      let cs = await prisma.classSubject.findFirst({ where: { class_id: cls.id, subject_id: subId } });
      if (!cs) cs = await prisma.classSubject.create({ data: { class_id: cls.id, subject_id: subId } });
      classSubjectMap[`${cls.id}-${subName}`] = cs.id;
    }
  }
  logger.info(`ClassSubjects seeded: ${Object.keys(classSubjectMap).length} combinations`);

  // ─── 5. SCHOOL ───────────────────────────────────────────────────────────────
  const school = await prisma.school.upsert({
    where: { keyword: "demo-school" },
    update: {},
    create: { keyword: "demo-school", name: "Demo School" },
  });
  logger.info(`School: ${school.name}`);

  // ─── 6. SCHOOL CLASS SUBJECTS ────────────────────────────────────────────────
  for (const gradeId of [6, 7]) {
    for (const subId of Object.values(subjectMap)) {
      const cs = await prisma.classSubject.findFirst({ where: { class_id: gradeId, subject_id: subId } });
      if (!cs) continue;
      await prisma.schoolClassSubject.upsert({
        where: { school_id_class_subject_id: { school_id: school.id, class_subject_id: cs.id } },
        update: {},
        create: { school_id: school.id, class_subject_id: cs.id },
      });

      classSubjects.push(cs);
    }
  }
  logger.info(`SchoolClassSubjects assigned for grades 6th and 7th`);

  // ─── 7. USERS ────────────────────────────────────────────────────────────────
  const pwdAdmin = await hashPassword("Admin@123");
  const pwdTeacher = await hashPassword("Teacher@123");
  const pwdStudent = await hashPassword("Student@123");

  await prisma.user.upsert({
    where: { school_id_login_id: { school_id: school.id, login_id: "superadmin" } },
    update: {},
    create: { school_id: school.id, login_id: "superadmin", name: "Super Admin", email: "superadmin@demo.com", role: Role.superadmin, password_hash: pwdAdmin, must_change_password: false },
  });
  await prisma.user.upsert({
    where: { school_id_login_id: { school_id: school.id, login_id: "admin" } },
    update: {},
    create: { school_id: school.id, login_id: "admin", name: "School Admin", email: "admin@demo.com", role: Role.admin, password_hash: pwdAdmin, must_change_password: false },
  });
  const teacher = await prisma.user.upsert({
    where: { school_id_login_id: { school_id: school.id, login_id: "teacher01" } },
    update: {},
    create: { school_id: school.id, login_id: "teacher01", name: "Priya Sharma", email: "teacher@demo.com", mobile: "9876543210", role: Role.teacher, password_hash: pwdTeacher, must_change_password: false },
  });
  const student = await prisma.user.upsert({
    where: { school_id_login_id: { school_id: school.id, login_id: "student01" } },
    update: {},
    create: { school_id: school.id, login_id: "student01", name: "Rohan Mehta", email: "student@demo.com", mobile: "9123456789", role: Role.student, password_hash: pwdStudent, must_change_password: false },
  });
  logger.info(`Users seeded (superadmin, admin, teacher, student)`);

  // ─── 8. USER CLASS SUBJECTS ──────────────────────────────────────────────────
  for (const gradeId of [6, 7]) {
    const cs = await prisma.classSubject.findFirst({ where: { class_id: gradeId, subject_id: subjectMap["Science"] } });
    if (cs) {
      await prisma.userClassSubject.upsert({
        where: { user_id_class_subject_id: { user_id: teacher.id, class_subject_id: cs.id } },
        update: {},
        create: { user_id: teacher.id, class_subject_id: cs.id },
      });
    }
  }
  for (const subName of subjectNames) {
    const cs = await prisma.classSubject.findFirst({ where: { class_id: 6, subject_id: subjectMap[subName] } });
    if (cs) {
      await prisma.userClassSubject.upsert({
        where: { user_id_class_subject_id: { user_id: student.id, class_subject_id: cs.id } },
        update: {},
        create: { user_id: student.id, class_subject_id: cs.id },
      });
    }
  }
  logger.info(`UserClassSubjects assigned`);

  /* -----------------------------
     MCQ QUESTIONS (3)
  ------------------------------*/
  const topic = await prisma.topic.findFirst();
  if (topic) {
    // MCQ 1: Who founded the Maurya Empire?
    const mcq1 = await prisma.question.create({
      data: {
        topic_id: topic.id,
        type: QuestionType.MCQ,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ text: "Who founded the Maurya Empire?", type: "text" }],
            },
          ],
        },
        explanation: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "Chandragupta Maurya founded the Maurya Empire in 322 BCE.",
                  type: "text",
                },
              ],
            },
          ],
        },
      },
    });

    await prisma.option.create({
      data: {
        question_id: mcq1.id,
        content: {
          type: "paragraph",
          content: [{ text: "Ashoka", type: "text" }],
        },
        isCorrect: false,
        display_order: 1,
      },
    });

    await prisma.option.create({
      data: {
        question_id: mcq1.id,
        content: {
          type: "paragraph",
          content: [{ text: "Chandragupta Maurya", type: "text" }],
        },
        isCorrect: true,
        display_order: 2,
      },
    });

    await prisma.option.create({
      data: {
        question_id: mcq1.id,
        content: {
          type: "paragraph",
          content: [{ text: "Harsha", type: "text" }],
        },
        isCorrect: false,
        display_order: 3,
      },
    });

    await prisma.option.create({
      data: {
        question_id: mcq1.id,
        content: {
          type: "paragraph",
          content: [{ text: "Bindusara", type: "text" }],
        },
        isCorrect: false,
        display_order: 4,
      },
    });

    // MCQ 2: Which gas is produced when zinc reacts with dilute hydrochloric acid?
    const mcq2 = await prisma.question.create({
      data: {
        topic_id: topic.id,
        type: QuestionType.MCQ,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [
                {
                  text: "Which gas is produced when zinc reacts with dilute hydrochloric acid?",
                  type: "text",
                },
              ],
            },
          ],
        },
        explanation: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: "left" },
              content: [
                {
                  text: "When zinc reacts with dilute hydrochloric acid, a chemical reaction takes place:",
                  type: "text",
                },
              ],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "center" },
              content: [
                { text: "Zn + 2HCL ", type: "text" },
                {
                  type: "inlineMath",
                  attrs: { latex: "\\rightarrow", display: "no", evaluate: "no" },
                },
                { text: " ZnCl", type: "text" },
                { text: "2", type: "text", marks: [{ type: "subscript" }] },
                { text: " + H", type: "text" },
                { text: "2", type: "text", marks: [{ type: "subscript" }] },
              ],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "left" },
              content: [
                {
                  text: "Zinc displaces hydrogen from hydrochloric acid, forming zinc chloride and releasing hydrogen gas. The gas produced can be identified because it burns with a 'pop' sound.",
                  type: "text",
                },
              ],
            },
          ],
        },
      },
    });

    await prisma.option.create({
      data: {
        question_id: mcq2.id,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [
                { text: "Oxygen (O", type: "text" },
                { text: "2", type: "text", marks: [{ type: "subscript" }] },
                { text: ")", type: "text" },
              ],
            },
          ],
        },
        isCorrect: false,
        display_order: 0,
      },
    });

    await prisma.option.create({
      data: {
        question_id: mcq2.id,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [
                { text: "Hydrogen (H", type: "text" },
                { text: "2", type: "text", marks: [{ type: "subscript" }] },
                { text: ")", type: "text" },
              ],
            },
          ],
        },
        isCorrect: true,
        display_order: 1,
      },
    });

    await prisma.option.create({
      data: {
        question_id: mcq2.id,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [
                { text: "Carbon dioxide (CO", type: "text" },
                { text: "2", type: "text", marks: [{ type: "subscript" }] },
                { text: ")", type: "text" },
              ],
            },
          ],
        },
        isCorrect: false,
        display_order: 2,
      },
    });

    await prisma.option.create({
      data: {
        question_id: mcq2.id,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [
                { text: "Nitrogen (N", type: "text" },
                { text: "2", type: "text", marks: [{ type: "subscript" }] },
                { text: ")", type: "text" },
              ],
            },
          ],
        },
        isCorrect: false,
        display_order: 3,
      },
    });

    // MCQ 3: If 2x² - 5x - 3 = 0, then the value of x is:
    const mcq3 = await prisma.question.create({
      data: {
        topic_id: topic.id,
        type: QuestionType.MCQ,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [{ text: "If:", type: "text" }],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "center" },
              content: [
                {
                  type: "inlineMath",
                  attrs: {
                    latex: "2x^2 - 5x - 3 = 0",
                    display: "no",
                    evaluate: "no",
                  },
                },
              ],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "left" },
              content: [
                { text: "then the value of ", type: "text" },
                {
                  type: "inlineMath",
                  attrs: { latex: "x", display: "no", evaluate: "no" },
                },
                { text: " is:", type: "text" },
              ],
            },
          ],
        },
        explanation: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [{ text: "Given:", type: "text" }],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "center" },
              content: [
                {
                  type: "inlineMath",
                  attrs: {
                    latex: "2x^2 - 5x - 3 = 0",
                    display: "no",
                    evaluate: "no",
                  },
                },
              ],
            },
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [{ text: "Using quadratic formula:", type: "text" }],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "center" },
              content: [
                {
                  type: "inlineMath",
                  attrs: {
                    latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
                    display: "no",
                    evaluate: "no",
                  },
                },
              ],
            },
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [
                { text: "Here,", type: "text" },
                { type: "hardBreak" },
                {
                  type: "inlineMath",
                  attrs: {
                    latex: "a = 2, \\quad b = -5, \\quad c = -3",
                    display: "no",
                    evaluate: "no",
                  },
                },
              ],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "center" },
              content: [
                {
                  type: "inlineMath",
                  attrs: {
                    latex: "x = \\frac{-(-5) \\pm \\sqrt{(-5)^2 - 4(2)(-3)}}{2(2)}",
                    display: "no",
                    evaluate: "no",
                  },
                },
              ],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "center" },
              content: [
                {
                  type: "inlineMath",
                  attrs: {
                    latex: "x = \\frac{5 \\pm \\sqrt{25 + 24}}{4}",
                    display: "no",
                    evaluate: "no",
                  },
                },
              ],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "center" },
              content: [
                {
                  type: "inlineMath",
                  attrs: {
                    latex: "x = \\frac{5 \\pm \\sqrt{49}}{4}",
                    display: "no",
                    evaluate: "no",
                  },
                },
              ],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "center" },
              content: [
                {
                  type: "inlineMath",
                  attrs: {
                    latex: "x = \\frac{5 \\pm 7}{4}",
                    display: "no",
                    evaluate: "no",
                  },
                },
              ],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "left" },
              content: [
                {
                  type: "inlineMath",
                  attrs: {
                    latex: "x = \\frac{5 + 7}{4} = \\frac{12}{4} = 3",
                    display: "no",
                    evaluate: "no",
                  },
                },
              ],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "left" },
              content: [
                {
                  type: "inlineMath",
                  attrs: {
                    latex: "x = \\frac{5 - 7}{4} = \\frac{-2}{4} = -\\frac{1}{2}",
                    display: "no",
                    evaluate: "no",
                  },
                },
              ],
            },
            {
              type: "paragraph",
              attrs: { textAlign: "left" },
              content: [
                { text: "Final Answer ", type: "text", marks: [{ type: "bold" }] },
                {
                  type: "inlineMath",
                  attrs: { latex: "\\rightarrow", display: "no", evaluate: "no" },
                },
                { text: " ", type: "text" },
                {
                  type: "inlineMath",
                  attrs: {
                    latex: "x = 3 \\quad \\text{or} \\quad x = -\\frac{1}{2}",
                    display: "no",
                    evaluate: "no",
                  },
                },
              ],
            },
          ],
        },
      },
    });

    await prisma.option.create({
      data: {
        question_id: mcq3.id,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [
                {
                  type: "inlineMath",
                  attrs: { latex: "x = 3", display: "no", evaluate: "no" },
                },
                { text: "  or  ", type: "text" },
                {
                  type: "inlineMath",
                  attrs: {
                    latex: "x = - \\frac{1}{2}",
                    display: "no",
                    evaluate: "no",
                  },
                },
                { text: "", type: "text" },
              ],
            },
          ],
        },
        isCorrect: true,
        display_order: 0,
      },
    });

    await prisma.option.create({
      data: {
        question_id: mcq3.id,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [
                {
                  type: "inlineMath",
                  attrs: { latex: "x = -3", display: "no", evaluate: "no" },
                },
                { text: " or ", type: "text" },
                {
                  type: "inlineMath",
                  attrs: {
                    latex: "x = - \\frac{1}{2}",
                    display: "no",
                    evaluate: "no",
                  },
                },
              ],
            },
          ],
        },
        isCorrect: false,
        display_order: 1,
      },
    });

    await prisma.option.create({
      data: {
        question_id: mcq3.id,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [
                {
                  type: "inlineMath",
                  attrs: { latex: "x = 1", display: "no", evaluate: "no" },
                },
                { text: " or ", type: "text" },
                {
                  type: "inlineMath",
                  attrs: { latex: "x = -3", display: "no", evaluate: "no" },
                },
              ],
            },
          ],
        },
        isCorrect: false,
        display_order: 2,
      },
    });

    await prisma.option.create({
      data: {
        question_id: mcq3.id,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [
                {
                  type: "inlineMath",
                  attrs: { latex: "x = -1", display: "no", evaluate: "no" },
                },
                { text: " or ", type: "text" },
                {
                  type: "inlineMath",
                  attrs: { latex: "x = 3", display: "no", evaluate: "no" },
                },
              ],
            },
          ],
        },
        isCorrect: false,
        display_order: 3,
      },
    });

    /* -----------------------------
     MSQ QUESTIONS (1)
  ------------------------------*/

    // MSQ: Which of the following are Fundamental Rights in India?
    const msq1 = await prisma.question.create({
      data: {
        topic_id: topic.id,
        type: QuestionType.MSQ,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "Which of the following are Fundamental Rights in India?",
                  type: "text",
                },
              ],
            },
          ],
        },
        explanation: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "Right to Equality and Right to Freedom are Fundamental Rights.",
                  type: "text",
                },
              ],
            },
          ],
        },
      },
    });

    await prisma.option.create({
      data: {
        question_id: msq1.id,
        content: {
          type: "paragraph",
          content: [{ text: "Right to Equality", type: "text" }],
        },
        isCorrect: true,
        display_order: 0,
      },
    });

    await prisma.option.create({
      data: {
        question_id: msq1.id,
        content: {
          type: "paragraph",
          content: [{ text: "Right to Freedom", type: "text" }],
        },
        isCorrect: true,
        display_order: 1,
      },
    });

    await prisma.option.create({
      data: {
        question_id: msq1.id,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [{ text: "Right to Vote", type: "text" }],
            },
          ],
        },
        isCorrect: false,
        display_order: 2,
      },
    });

    await prisma.option.create({
      data: {
        question_id: msq1.id,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [{ text: "Right to Property", type: "text" }],
            },
          ],
        },
        isCorrect: false,
        display_order: 3,
      },
    });

    /* -----------------------------
     TRUE / FALSE QUESTIONS (2)
  ------------------------------*/

    // TRUE/FALSE 1: The Constitution of India came into effect in 1950
    const tf1 = await prisma.question.create({
      data: {
        topic_id: topic.id,
        type: QuestionType.TRUE_FALSE,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "The Constitution of India came into effect in 1950.",
                  type: "text",
                },
              ],
            },
          ],
        },
        explanation: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "Yes, it came into effect on 26 January 1950.",
                  type: "text",
                },
              ],
            },
          ],
        },
      },
    });

    await prisma.option.create({
      data: {
        question_id: tf1.id,
        content: {
          type: "paragraph",
          content: [{ text: "True", type: "text" }],
        },
        isCorrect: true,
        display_order: 1,
      },
    });

    await prisma.option.create({
      data: {
        question_id: tf1.id,
        content: {
          type: "paragraph",
          content: [{ text: "False", type: "text" }],
        },
        isCorrect: false,
        display_order: 2,
      },
    });

    // TRUE/FALSE 2: Every Regular Language is also a Context-Free Language
    const tf2 = await prisma.question.create({
      data: {
        topic_id: topic.id,
        type: QuestionType.TRUE_FALSE,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "Every Regular Language is also a Context-Free Language.",
                  type: "text",
                },
              ],
            },
          ],
        },
        explanation: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "Every Regular Language can be described by a Regular Grammar, which is a special case of Context-Free Grammar.",
                  type: "text",
                },
              ],
            },
          ],
        },
      },
    });

    await prisma.option.create({
      data: {
        question_id: tf2.id,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [{ text: "True", type: "text" }],
            },
          ],
        },
        isCorrect: true,
        display_order: 0,
      },
    });

    await prisma.option.create({
      data: {
        question_id: tf2.id,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: { textAlign: null },
              content: [{ text: "False", type: "text" }],
            },
          ],
        },
        isCorrect: false,
        display_order: 1,
      },
    });
  }

  logger.info("🌱 Seeding complete.");
  logger.info("Login: admin@demo.com (superadmin), admin2@demo.com (admin), student@demo.com — password: Pwd@123");
  await prisma.userClassSubject.createMany({
    data: userClassData,
    skipDuplicates: true,
  });
  // ─── 9. XP RULES ────────────────────────────────────────────────────────────
  const xpRules = [
    { activity_type: "LOGIN", activity_displayname: "Daily Login", xp_points: 3 },
    { activity_type: "LOGIN_STREAK_3D", activity_displayname: "3-Day Login Streak", xp_points: 10 },
    { activity_type: "LOGIN_STREAK_7D", activity_displayname: "7-Day Login Streak", xp_points: 25 },
    { activity_type: "LOGIN_MISSED_7D", activity_displayname: "Missed Login for 7 Days", xp_points: -50 },
    { activity_type: "PAGE_COMPLETE", activity_displayname: "Page Completed", xp_points: 2 },
    { activity_type: "TOPIC_COMPLETE", activity_displayname: "Topic Completed", xp_points: 10 },
    { activity_type: "ANSWER_CORRECT", activity_displayname: "Correct Answer", xp_points: 1 },
    { activity_type: "ANSWER_WRONG", activity_displayname: "Wrong Answer", xp_points: -1 },
    { activity_type: "DID_FLASHCARDS", activity_displayname: "Flashcards Completed", xp_points: 8 },
    { activity_type: "REVISION_COMPLETE", activity_displayname: "Revision Completed", xp_points: 5 },
  ];
  for (const rule of xpRules) {
    await prisma.xpRule.upsert({ where: { activity_type: rule.activity_type }, update: {}, create: rule });
  }
  logger.info(`XP Rules seeded (${xpRules.length} rules)`);

  // ─── 10. GAMIFICATION STATE ──────────────────────────────────────────────────
  await prisma.studentGamificationState.upsert({
    where: { student_id: student.id },
    update: {},
    create: { student_id: student.id, total_xp: 45, current_streak: 3, longest_streak: 5, last_active_date: new Date() },
  });
  logger.info(`Student gamification state seeded`);

  // ─── 11. BOOKS → CHAPTERS → TOPICS → PAGES ───────────────────────────────
  type TopicEntry = { title: string; order_no: number; pages: number };
  type ChapterEntry = { title: string; order_no: number; topics: TopicEntry[] };
  type BookEntry = { bookTitle: string; chapters: ChapterEntry[] };
  type CurriculumMap = Record<string, Record<number, BookEntry[] | BookEntry>>;

  const curriculum: CurriculumMap = {
    Mathematics: {
      6: [
        {
          bookTitle: "Mathematics - Class 6 Part 1", chapters: [
            {
              title: "Chapter 1: Knowing Our Numbers", order_no: 1, topics: [
                { title: "Introduction to Large Numbers", order_no: 1, pages: 2 },
                { title: "Comparing Numbers", order_no: 2, pages: 2 },
              ]
            },
            {
              title: "Chapter 2: Whole Numbers", order_no: 2, topics: [
                { title: "Natural Numbers and Whole Numbers", order_no: 1, pages: 2 },
                { title: "Number Line", order_no: 2, pages: 2 },
              ]
            },
          ]
        },
        {
          bookTitle: "Mathematics - Class 6 Part 2", chapters: [
            {
              title: "Chapter 1: Playing with Numbers", order_no: 1, topics: [
                { title: "Factors and Multiples", order_no: 1, pages: 2 },
                { title: "LCM and HCF", order_no: 2, pages: 2 },
              ]
            },
          ]
        }
      ],
      7: {
        bookTitle: "Mathematics - Class 7", chapters: [
          {
            title: "Chapter 1: Integers", order_no: 1, topics: [
              { title: "Recall of Integers", order_no: 1, pages: 2 },
              { title: "Operations on Integers", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: Fractions and Decimals", order_no: 2, topics: [
              { title: "Multiplication of Fractions", order_no: 1, pages: 2 },
              { title: "Division of Fractions", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      8: {
        bookTitle: "Mathematics - Class 8", chapters: [
          {
            title: "Chapter 1: Rational Numbers", order_no: 1, topics: [
              { title: "Properties of Rational Numbers", order_no: 1, pages: 2 },
              { title: "Rational Numbers on Number Line", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: Linear Equations", order_no: 2, topics: [
              { title: "Solving Linear Equations", order_no: 1, pages: 2 },
              { title: "Applications of Linear Equations", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      9: {
        bookTitle: "Mathematics - Class 9", chapters: [
          {
            title: "Chapter 1: Number Systems", order_no: 1, topics: [
              { title: "Irrational Numbers", order_no: 1, pages: 2 },
              { title: "Real Numbers and Decimals", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: Polynomials", order_no: 2, topics: [
              { title: "Polynomials and Their Degrees", order_no: 1, pages: 2 },
              { title: "Remainder and Factor Theorem", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      10: {
        bookTitle: "Mathematics - Class 10", chapters: [
          {
            title: "Chapter 1: Real Numbers", order_no: 1, topics: [
              { title: "Euclid's Division Lemma", order_no: 1, pages: 2 },
              { title: "Fundamental Theorem of Arithmetic", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: Polynomials", order_no: 2, topics: [
              { title: "Zeroes of a Polynomial", order_no: 1, pages: 2 },
              { title: "Relationship Between Zeroes and Coefficients", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
    },
    Science: {
      6: [
        {
          bookTitle: "Science - Class 6 Part 1", chapters: [
            {
              title: "Chapter 1: Food - Where Does It Come From?", order_no: 1, topics: [
                { title: "Sources of Food", order_no: 1, pages: 3 },
                { title: "Plant Parts as Food", order_no: 2, pages: 2 },
              ]
            },
            {
              title: "Chapter 2: Components of Food", order_no: 2, topics: [
                { title: "Nutrients in Food", order_no: 1, pages: 2 },
                { title: "Deficiency Diseases", order_no: 2, pages: 2 },
              ]
            },
          ]
        },
        {
          bookTitle: "Science - Class 6 Part 2", chapters: [
            {
              title: "Chapter 3: Fibre to Fabric", order_no: 1, topics: [
                { title: "Plant Fibres", order_no: 1, pages: 2 },
                { title: "Animal Fibres", order_no: 2, pages: 2 },
              ]
            },
          ]
        }
      ],
      7: {
        bookTitle: "Science - Class 7", chapters: [
          {
            title: "Chapter 1: Nutrition in Plants", order_no: 1, topics: [
              { title: "Photosynthesis", order_no: 1, pages: 2 },
              { title: "Modes of Nutrition", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: Nutrition in Animals", order_no: 2, topics: [
              { title: "Digestion in Humans", order_no: 1, pages: 2 },
              { title: "Digestion in Grass-eating Animals", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      8: {
        bookTitle: "Science - Class 8", chapters: [
          {
            title: "Chapter 1: Crop Production", order_no: 1, topics: [
              { title: "Agricultural Practices", order_no: 1, pages: 2 },
              { title: "Irrigation and Harvesting", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: Microorganisms", order_no: 2, topics: [
              { title: "Types of Microorganisms", order_no: 1, pages: 2 },
              { title: "Harmful and Useful Microorganisms", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      9: {
        bookTitle: "Science - Class 9", chapters: [
          {
            title: "Chapter 1: Matter in Our Surroundings", order_no: 1, topics: [
              { title: "States of Matter", order_no: 1, pages: 2 },
              { title: "Interconversion of States", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: Is Matter Pure?", order_no: 2, topics: [
              { title: "Mixtures and Solutions", order_no: 1, pages: 2 },
              { title: "Separation Techniques", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      10: {
        bookTitle: "Science - Class 10", chapters: [
          {
            title: "Chapter 1: Chemical Reactions", order_no: 1, topics: [
              { title: "Types of Chemical Reactions", order_no: 1, pages: 2 },
              { title: "Oxidation and Reduction", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: Acids, Bases and Salts", order_no: 2, topics: [
              { title: "Properties of Acids and Bases", order_no: 1, pages: 2 },
              { title: "pH Scale and Salts", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
    },
    "Social Studies": {
      6: {
        bookTitle: "Social Studies - Class 6", chapters: [
          {
            title: "Chapter 1: What, Where, How and When?", order_no: 1, topics: [
              { title: "Finding Out About the Past", order_no: 1, pages: 2 },
              { title: "What Do Dates Mean?", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: On the Trail of Earliest People", order_no: 2, topics: [
              { title: "Hunter-Gatherers", order_no: 1, pages: 2 },
              { title: "A Changing Environment", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      7: {
        bookTitle: "Social Studies - Class 7", chapters: [
          {
            title: "Chapter 1: Tracing Changes Through a Thousand Years", order_no: 1, topics: [
              { title: "New and Old Terminologies", order_no: 1, pages: 2 },
              { title: "Historians and Their Sources", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: New Kings and Kingdoms", order_no: 2, topics: [
              { title: "Prashastis and Land Grants", order_no: 1, pages: 2 },
              { title: "Administration and Army", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      8: {
        bookTitle: "Social Studies - Class 8", chapters: [
          {
            title: "Chapter 1: How, When and Where", order_no: 1, topics: [
              { title: "How Important Are Dates?", order_no: 1, pages: 2 },
              { title: "Colonial Governance", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: From Trade to Territory", order_no: 2, topics: [
              { title: "The East India Company", order_no: 1, pages: 2 },
              { title: "Expansion of British Power", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      9: {
        bookTitle: "Social Studies - Class 9", chapters: [
          {
            title: "Chapter 1: The French Revolution", order_no: 1, topics: [
              { title: "French Society Before the Revolution", order_no: 1, pages: 2 },
              { title: "The Outbreak of the Revolution", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: Socialism in Europe", order_no: 2, topics: [
              { title: "The Age of Social Change", order_no: 1, pages: 2 },
              { title: "The Russian Revolution", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      10: {
        bookTitle: "Social Studies - Class 10", chapters: [
          {
            title: "Chapter 1: The Rise of Nationalism in Europe", order_no: 1, topics: [
              { title: "The French Revolution and the Idea of the Nation", order_no: 1, pages: 2 },
              { title: "The Making of Nationalism in Europe", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: Nationalism in India", order_no: 2, topics: [
              { title: "The First World War and Nationalism", order_no: 1, pages: 2 },
              { title: "The Non-Cooperation Movement", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
    },
    English: {
      6: {
        bookTitle: "English - Class 6", chapters: [
          {
            title: "Chapter 1: Who Did Patrick's Homework?", order_no: 1, topics: [
              { title: "Story and Characters", order_no: 1, pages: 2 },
              { title: "Comprehension and Vocabulary", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: How the Dog Found Himself a New Master", order_no: 2, topics: [
              { title: "The Story", order_no: 1, pages: 2 },
              { title: "Word Meanings and Questions", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      7: {
        bookTitle: "English - Class 7", chapters: [
          {
            title: "Chapter 1: Three Questions", order_no: 1, topics: [
              { title: "Story Summary", order_no: 1, pages: 2 },
              { title: "Comprehension Exercises", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: A Gift of Chappals", order_no: 2, topics: [
              { title: "Characters and Plot", order_no: 1, pages: 2 },
              { title: "Language and Grammar", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      8: {
        bookTitle: "English - Class 8", chapters: [
          {
            title: "Chapter 1: The Best Christmas Present", order_no: 1, topics: [
              { title: "Story and Setting", order_no: 1, pages: 2 },
              { title: "Comprehension and Writing", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: The Tsunami", order_no: 2, topics: [
              { title: "The Disaster", order_no: 1, pages: 2 },
              { title: "Survivors and Stories", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      9: {
        bookTitle: "English - Class 9", chapters: [
          {
            title: "Chapter 1: The Fun They Had", order_no: 1, topics: [
              { title: "Story and Theme", order_no: 1, pages: 2 },
              { title: "Comprehension Questions", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: The Sound of Music", order_no: 2, topics: [
              { title: "Evelyn Glennie's Story", order_no: 1, pages: 2 },
              { title: "The Shehnai of Bismillah Khan", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      10: {
        bookTitle: "English - Class 10", chapters: [
          {
            title: "Chapter 1: A Letter to God", order_no: 1, topics: [
              { title: "Story and Summary", order_no: 1, pages: 2 },
              { title: "Comprehension and Values", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: Nelson Mandela", order_no: 2, topics: [
              { title: "The Long Walk to Freedom", order_no: 1, pages: 2 },
              { title: "Themes and Language", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
    },
    Hindi: {
      6: {
        bookTitle: "Hindi - Class 6", chapters: [
          {
            title: "Chapter 1: Vah Chidiya Jo", order_no: 1, topics: [
              { title: "Poem and Explanation", order_no: 1, pages: 2 },
              { title: "Comprehension", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: Bachpan", order_no: 2, topics: [
              { title: "Lesson Summary", order_no: 1, pages: 2 },
              { title: "Questions and Answers", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      7: {
        bookTitle: "Hindi - Class 7", chapters: [
          {
            title: "Chapter 1: Hum Panchhi Unmukta Gagan Ke", order_no: 1, topics: [
              { title: "Poem and Meaning", order_no: 1, pages: 2 },
              { title: "Questions and Exercises", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: Dadi Maa", order_no: 2, topics: [
              { title: "Story and Characters", order_no: 1, pages: 2 },
              { title: "Comprehension", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      8: {
        bookTitle: "Hindi - Class 8", chapters: [
          {
            title: "Chapter 1: Dhwani", order_no: 1, topics: [
              { title: "Poem and Explanation", order_no: 1, pages: 2 },
              { title: "Questions and Exercises", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: Lakh Ki Churiyaan", order_no: 2, topics: [
              { title: "Story and Summary", order_no: 1, pages: 2 },
              { title: "Comprehension", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      9: {
        bookTitle: "Hindi - Class 9", chapters: [
          {
            title: "Chapter 1: Do Bailon Ki Katha", order_no: 1, topics: [
              { title: "Story and Characters", order_no: 1, pages: 2 },
              { title: "Comprehension and Language", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: Lhasa Ki Or", order_no: 2, topics: [
              { title: "Travel Account", order_no: 1, pages: 2 },
              { title: "Questions and Answers", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
      10: {
        bookTitle: "Hindi - Class 10", chapters: [
          {
            title: "Chapter 1: Surdas Ke Pad", order_no: 1, topics: [
              { title: "Poems and Meanings", order_no: 1, pages: 2 },
              { title: "Comprehension and Exercises", order_no: 2, pages: 2 },
            ]
          },
          {
            title: "Chapter 2: Ram-Lakshman-Parasuram Samvad", order_no: 2, topics: [
              { title: "The Dialogue", order_no: 1, pages: 2 },
              { title: "Explanation and Questions", order_no: 2, pages: 2 },
            ]
          },
        ]
      },
    },
  };

  let scienceCs6Id: number | null = null;
  let totalBooks = 0;

  for (const [subjectName, classMap] of Object.entries(curriculum)) {
    for (const [classIdStr, classData] of Object.entries(classMap)) {
      const classId = Number(classIdStr);
      const cs = await prisma.classSubject.findFirst({
        where: { class_id: classId, subject_id: subjectMap[subjectName] },
      });
      if (!cs) continue;

      const booksToSeed = Array.isArray(classData) ? classData : [classData];

      for (const { bookTitle, chapters } of booksToSeed) {
        let book = await prisma.book.findFirst({ where: { class_subject_id: cs.id, title: bookTitle } });
        if (!book) {
          book = await prisma.book.create({ data: { class_subject_id: cs.id, title: bookTitle, order_no: 1 } });
        }
        totalBooks++;

        for (const chapterData of chapters) {
          let chapter = await prisma.chapter.findFirst({ where: { book_id: book.id, title: chapterData.title } });
          if (!chapter) {
            chapter = await prisma.chapter.create({ data: { book_id: book.id, title: chapterData.title, order_no: chapterData.order_no } });
          }

          for (const topicData of chapterData.topics) {
            let topic = await prisma.topic.findFirst({ where: { chapter_id: chapter.id, title: topicData.title } });
            if (!topic) {
              topic = await prisma.topic.create({ data: { chapter_id: chapter.id, title: topicData.title, order_no: topicData.order_no } });
            }

            for (let p = 1; p <= topicData.pages; p++) {
              const exists = await prisma.page.findFirst({ where: { topic_id: topic.id, page_order: p } });
              if (!exists) {
                await prisma.page.create({
                  data: {
                    topic_id: topic.id, page_order: p, is_published: true,
                    content_json: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: `${topicData.title} — Page ${p}.` }] }] },
                    content_html: `<p>${topicData.title} — Page ${p}.</p>`,
                    content_text: `${topicData.title} — Page ${p}.`,
                  },
                });
              }
            }
          }
        }
      }

      if (subjectName === "Science" && classId === 6) scienceCs6Id = cs.id;
    }
  }
  logger.info(`${totalBooks} books seeded (Book → Chapter → Topic → Page)`);

  // ─── 12. SAMPLE STUDENT PROGRESS ──────────────────────────────────────────
  if (scienceCs6Id) {
    const sciBook = await prisma.book.findFirst({ where: { class_subject_id: scienceCs6Id } });
    if (sciBook) {
      const firstChapter = await prisma.chapter.findFirst({ where: { book_id: sciBook.id, order_no: 1 } });
      if (firstChapter) {
        const firstTopic = await prisma.topic.findFirst({ where: { chapter_id: firstChapter.id, order_no: 1 } });
        if (firstTopic) {
          // We need class_subject_id for progress records
          const scienceCs6 = await prisma.classSubject.findFirst({ where: { id: scienceCs6Id! } });
          const csId = scienceCs6?.id ?? 0;
          await prisma.studentTopicProgress.upsert({
            where: { student_id_topic_id: { student_id: student.id, topic_id: firstTopic.id } },
            update: {},
            create: { student_id: student.id, topic_id: firstTopic.id, class_subject_id: csId, accuracy: 0.80, last_activity_at: new Date() },
          });
          const firstPage = await prisma.page.findFirst({ where: { topic_id: firstTopic.id, page_order: 1 } });
          if (firstPage) {
            await prisma.studentPageProgress.upsert({
              where: { student_id_page_id: { student_id: student.id, page_id: firstPage.id } },
              update: {},
              create: { student_id: student.id, page_id: firstPage.id, class_subject_id: csId, is_completed: true, completed_at: new Date() },
            });
          }
        }
      }
    }
  }
  logger.info(`Student progress seeded`);
  logger.info("Seed completed successfully!");
}

main()
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });