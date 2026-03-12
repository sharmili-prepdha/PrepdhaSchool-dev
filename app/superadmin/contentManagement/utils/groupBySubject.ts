import type { ClassSubjectWithContent } from "@/lib/contentMetadata/data";

export type GroupedBySubject = [string, ClassSubjectWithContent[]][];

export function groupBySubject(classSubjects: ClassSubjectWithContent[]): GroupedBySubject {
  const map = new Map<string, ClassSubjectWithContent[]>();
  for (const cs of classSubjects) {
    const key = cs.subject.name;
    const arr = map.get(key) ?? [];
    arr.push(cs);
    map.set(key, arr);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => a.class_id - b.class_id);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}
