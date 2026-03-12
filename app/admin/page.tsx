import { getAuthUser } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { redirect } from "next/navigation";

export default async function SchoolAdminPage() {
  const session = await getAuthUser();
  logger.info(`inside AdminPage , session value is ${JSON.stringify(session)}`);
  if (!session) redirect("/login");

  return (
    <div className="flex h-full items-center justify-center text-gray-500">
      <p className="text-xl">Select a user from the sidebar to manage their subjects.</p>
    </div>
  );
}
