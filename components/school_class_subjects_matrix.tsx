"use client";

import { useState, useTransition } from "react";
import { updateSchoolClassSubjects } from "@/features/schoolManagement/actions/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ClassType = {
  id: number;
  name: string;
};

type SubjectType = {
  id: number;
  name: string;
};

type ClassSubjectType = {
  id: number;
  class_id: number;
  subject_id: number;
};

type SchoolClassSubjectType = {
  schoolId: number;
  classSubjectId: number;
};

type PropsType = {
  schoolId: number;
  classes: ClassType[];
  subjects: SubjectType[];
  classSubjects: ClassSubjectType[];
  initialSchoolClassSubjects: SchoolClassSubjectType[];
};

export default function SchoolClassSubjectsMatrix({
  schoolId,
  classes,
  subjects,
  classSubjects,
  initialSchoolClassSubjects,
}: PropsType) {
  const initialSelectedPairs = initialSchoolClassSubjects
    .map((scs) => {
      // Find matching class_subject from the join array
      const cs = classSubjects.find((c) => c.id === scs.classSubjectId);
      return {
        class_id: cs?.class_id || 0,
        subject_id: cs?.subject_id || 0,
      };
    })
    .filter((pair) => pair.class_id !== 0);

  const [selectedPairs, setSelectedPairs] =
    useState<{ class_id: number; subject_id: number }[]>(initialSelectedPairs);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<"idle" | "success" | "error">("idle");

  const isPairSelected = (classId: number, subjectId: number) => {
    return selectedPairs.some((p) => p.class_id === classId && p.subject_id === subjectId);
  };

  const handleCheckbox = (classId: number, subjectId: number, checked: boolean) => {
    if (checked) {
      setSelectedPairs((prev) => [...prev, { class_id: classId, subject_id: subjectId }]);
    } else {
      setSelectedPairs((prev) =>
        prev.filter((p) => !(p.class_id === classId && p.subject_id === subjectId)),
      );
    }
  };

  const handleColumnToggle = (classId: number, checked: boolean) => {
    if (checked) {
      const newPairs = subjects.map((s) => ({ class_id: classId, subject_id: s.id }));
      setSelectedPairs((prev) => {
        const combined = [...prev, ...newPairs];
        // remove duplicates
        const unique: { class_id: number; subject_id: number }[] = [];
        const seen = new Set();
        for (const p of combined) {
          const key = `${p.class_id}-${p.subject_id}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(p);
          }
        }
        return unique;
      });
    } else {
      setSelectedPairs((prev) => prev.filter((p) => p.class_id !== classId));
    }
  };

  const handleSubmit = () => {
    startTransition(async () => {
      setStatusMessage("idle");
      const result = await updateSchoolClassSubjects(schoolId, selectedPairs);
      if (result.success) {
        setStatusMessage("success");
      } else {
        setStatusMessage("error");
      }
      setTimeout(() => setStatusMessage("idle"), 3000);
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-50 border-r">Subject</TableHead>
              {classes.map((cls) => (
                <TableHead key={cls.id} className="border-r last:border-r-0 text-center">
                  <label className="flex items-center justify-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={subjects.every((s) => isPairSelected(cls.id, s.id))}
                      onCheckedChange={(checked) => handleColumnToggle(cls.id, checked === true)}
                    />
                    {cls.name.toUpperCase()}
                  </label>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-medium border-r bg-muted/50">{subject.name}</TableCell>
                {classes.map((cls) => (
                  <TableCell
                    key={`${cls.id}-${subject.id}`}
                    className="text-center border-r last:border-r-0"
                  >
                    <Checkbox
                      checked={isPairSelected(cls.id, subject.id)}
                      onCheckedChange={(checked) =>
                        handleCheckbox(cls.id, subject.id, checked === true)
                      }
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end items-center gap-4">
        {statusMessage === "success" && (
          <div className="text-green-600 text-sm font-medium bg-green-50 px-3 py-1.5 rounded-md border border-green-200 transition-opacity">
            Subjects Assigned Successfully
          </div>
        )}
        {statusMessage === "error" && (
          <div className="text-red-600 text-sm font-medium bg-red-50 px-3 py-1.5 rounded-md border border-red-200 transition-opacity">
            Failed to assign subjects
          </div>
        )}
        <Button onClick={handleSubmit} disabled={isPending} variant="default">
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
