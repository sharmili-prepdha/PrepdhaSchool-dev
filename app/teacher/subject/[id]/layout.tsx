import { ReactNode } from "react";

export default function SubjectLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto pb-10">{children}</div>
  );
}
