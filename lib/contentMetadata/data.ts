import { prisma } from "@/lib/prisma";

export type ClassSubjectWithContent = {
  id: number;
  class_id: number;
  subject_id: number;
  class: { id: number; name: string };
  subject: { id: number; name: string };
  books: {
    id: number;
    title: string;
    order_no: number | null;
    thumbnail_url: string | null;
    chapters: {
      id: number;
      title: string;
      order_no: number | null;
      topics: {
        id: number;
        title: string;
        order_no: number | null;
        pages: {
          id: number;
          page_order: number | null;
          is_published: boolean;
        }[];
      }[];
    }[];
  }[];
};

export type SchoolWithContent = {
  id: number;
  name: string;
  keyword: string;
  classSubjects: ClassSubjectWithContent[];
};

/**
 * Fetch all schools with their enabled ClassSubjects and full content hierarchy.
 * For superadmin: shows all schools and their content.
 */
export async function fetchSchoolsWithContent(): Promise<SchoolWithContent[]> {
  const schools = await prisma.school.findMany({
    where: { is_active: true },
    select: {
      id: true,
      name: true,
      keyword: true,
      school_class_subject: {
        include: {
          class_subject: {
            include: {
              class: true,
              subject: true,
              books: {
                include: {
                  chapters: {
                    include: {
                      topics: {
                        include: {
                          page: {
                            select: { id: true, page_order: true, is_published: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return schools.map((s) => ({
    id: s.id,
    name: s.name,
    keyword: s.keyword,
    classSubjects: s.school_class_subject.map((scs) => ({
      id: scs.class_subject.id,
      class_id: scs.class_subject.class_id,
      subject_id: scs.class_subject.subject_id,
      class: scs.class_subject.class,
      subject: scs.class_subject.subject,
      books: scs.class_subject.books.map((b) => ({
        id: b.id,
        title: b.title,
        order_no: b.order_no,
        thumbnail_url: b.thumbnail_url,
        chapters: b.chapters.map((ch) => ({
          id: ch.id,
          title: ch.title,
          order_no: ch.order_no,
          topics: ch.topics.map((t) => ({
            id: t.id,
            title: t.title,
            order_no: t.order_no,
            pages: t.page.map((p) => ({
              id: p.id,
              page_order: p.page_order,
              is_published: p.is_published,
            })),
          })),
        })),
      })),
    })),
  }));
}

/**
 * Fetch all ClassSubjects with books, topics, and pages.
 * For superadmin content management: shows all content regardless of school.
 */
export async function fetchAllClassSubjectsWithContent(): Promise<ClassSubjectWithContent[]> {
  const rows = await prisma.classSubject.findMany({
    include: {
      class: true,
      subject: true,
      books: {
        include: {
          chapters: {
            include: {
              topics: {
                include: {
                  page: {
                    select: { id: true, page_order: true, is_published: true },
                    orderBy: { page_order: "asc" },
                  },
                },
                orderBy: { order_no: "asc" },
              },
            },
            orderBy: { order_no: "asc" },
          },
        },
        orderBy: { order_no: "asc" },
      },
    },
    orderBy: [{ class_id: "asc" }, { subject_id: "asc" }],
  });

  return rows.map((cs) => ({
    id: cs.id,
    class_id: cs.class_id,
    subject_id: cs.subject_id,
    class: cs.class,
    subject: cs.subject,
    books: cs.books.map((b) => ({
      id: b.id,
      title: b.title,
      order_no: b.order_no,
      thumbnail_url: b.thumbnail_url,
      chapters: b.chapters.map((ch) => ({
        id: ch.id,
        title: ch.title,
        order_no: ch.order_no,
        topics: ch.topics.map((t) => ({
          id: t.id,
          title: t.title,
          order_no: t.order_no,
          pages: t.page.map((p) => ({
            id: p.id,
            page_order: p.page_order,
            is_published: p.is_published,
          })),
        })),
      })),
    })),
  }));
}

/**
 * Fetch a single school's content hierarchy.
 * For admin: shows only their school's enabled ClassSubjects.
 */
export async function fetchSchoolContent(schoolId: number): Promise<SchoolWithContent | null> {
  const school = await prisma.school.findUnique({
    where: { id: schoolId, is_active: true },
    select: {
      id: true,
      name: true,
      keyword: true,
      school_class_subject: {
        include: {
          class_subject: {
            include: {
              class: true,
              subject: true,
              books: {
                include: {
                  chapters: {
                    include: {
                      topics: {
                        include: {
                          page: {
                            select: { id: true, page_order: true, is_published: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!school) return null;

  return {
    id: school.id,
    name: school.name,
    keyword: school.keyword,
    classSubjects: school.school_class_subject.map((scs) => ({
      id: scs.class_subject.id,
      class_id: scs.class_subject.class_id,
      subject_id: scs.class_subject.subject_id,
      class: scs.class_subject.class,
      subject: scs.class_subject.subject,
      books: scs.class_subject.books.map((b) => ({
        id: b.id,
        title: b.title,
        order_no: b.order_no,
        thumbnail_url: b.thumbnail_url,
        chapters: b.chapters.map((ch) => ({
          id: ch.id,
          title: ch.title,
          order_no: ch.order_no,
          topics: ch.topics.map((t) => ({
            id: t.id,
            title: t.title,
            order_no: t.order_no,
            pages: t.page.map((p) => ({
              id: p.id,
              page_order: p.page_order,
              is_published: p.is_published,
            })),
          })),
        })),
      })),
    })),
  };
}
