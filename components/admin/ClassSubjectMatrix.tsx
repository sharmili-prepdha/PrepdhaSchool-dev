"use client";

import { useState } from "react";
import { updateUserSubjects } from "@/features/admin/actions/admin.action";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SubjectsAlert } from "./SubjectsAlert";
import { logger } from "@/lib/logger";

type ClassType = {
  id: number;
  name: string;
};

type SubjectType = {
  id: number;
  name: string;
};

type SchoolClassSubjectType = {
  school_id: number;
  class_subject_id: number;
  class_subject: {
    id: number;
    class_id: number;
    subject_id: number;
  };
};

type Props = {
  classes: ClassType[];
  subjects: SubjectType[];
  schoolClassSubjects: SchoolClassSubjectType[];
  selectedSubjectIds: number[];
  userId: number;
  schoolId: number;
};

export default function ClassSubjectMatrix({
  classes,
  subjects,
  schoolClassSubjects,
  selectedSubjectIds: initialSelectedIds,
  userId,
  schoolId,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds || []);
  const [loading, setLoading] = useState(false);
  const [assigned, setAssigned] = useState(false);
  const [notAssigned, setNotAssigned] = useState(false);
  const [errassign, setErrassign] = useState(false);

  // Map to find class_subject_id easily
  const classSubjectMap = new Map<string, number>();
  schoolClassSubjects.forEach((scs) => {
    classSubjectMap.set(
      `${scs.class_subject.class_id}-${scs.class_subject.subject_id}`,
      scs.class_subject_id,
    );
  });

  const handleCheckbox = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateUserSubjects(userId, schoolId, selectedIds);
      if (result.success) {
        // alert("Subjects Assigned Successfully");
        setAssigned(true);
        setTimeout(() => {
          setAssigned(false);
        }, 2000);
      } else {
        // alert("Failed to assign subjects");
        setNotAssigned(true);
        setTimeout(() => {
          setNotAssigned(false);
        }, 2000);
      }
    } catch (error) {
      logger.error(`Error assigning subjects: ${error}`);
      setErrassign(true);
      setTimeout(() => {
        setErrassign(false);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };
  const handleColumnToggle = (classId: number, checked: boolean) => {
    // Get all class_subject_id for this class
    const columnIds = schoolClassSubjects
      .filter((scs) => scs.class_subject.class_id === classId)
      .map((scs) => scs.class_subject_id);

    if (checked) {
      // Add all ids (avoid duplicates)
      setSelectedIds((prev) => [...new Set([...prev, ...columnIds])]);
    } else {
      // Remove all ids of this column
      setSelectedIds((prev) => prev.filter((id) => !columnIds.includes(id)));
    }
    logger.info(selectedIds);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-900 border-r">Subject</th>
              {classes.map((cls) => {
                const classSubjects = schoolClassSubjects.filter(
                  (scs) => scs.class_subject.class_id === cls.id,
                );
                const hasSubjects = classSubjects.length > 0;

                return (
                  <th
                    key={cls.id}
                    className="px-4 py-3 font-medium text-gray-900 border-r last:border-r-0 text-center"
                  >
                    <Checkbox
                      className="border-black"
                      disabled={!hasSubjects}
                      checked={
                        hasSubjects &&
                        classSubjects.every((scs) => selectedIds.includes(scs.class_subject_id))
                      }
                      onCheckedChange={(checked) => handleColumnToggle(cls.id, checked as boolean)}
                    />{" "}
                    {cls.name}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td className="px-4 py-3 font-medium text-gray-900 border-r border-gray-200 bg-gray-50/50">
                  {subject.name}
                </td>
                {classes.map((cls) => {
                  const key = `${cls.id}-${subject.id}`;
                  const id = classSubjectMap.get(key);
                  const isAvailable = id !== undefined;

                  return (
                    <td
                      key={key}
                      className="px-4 py-3 text-center border-r border-gray-200 last:border-r-0"
                    >
                      {isAvailable ? (
                        <Checkbox
                          className="border-black"
                          checked={selectedIds.includes(id)}
                          onCheckedChange={(checked) => handleCheckbox(id, checked as boolean)}
                        />
                      ) : (
                        <span className="text-black">N/A</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      <div className="flex justify-end items-end">
        {assigned && <SubjectsAlert message="Subjects Assigned Successfully" state={true} />}
        {notAssigned && <SubjectsAlert message="Failed to assign subjects" state={false} />}
        {errassign && <SubjectsAlert message="Error assigning subjects" state={false} />}
      </div>
    </div>
  );
}
