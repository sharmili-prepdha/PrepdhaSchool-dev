import { ReflectionCard } from "@/components/ReflectionCard";
import { getAuthUser } from "@/lib/auth/auth";
import { ROLE_DEFAULT_PATH } from "@/lib/auth/route-config";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const user = await getAuthUser();
  if (user) {
    redirect(ROLE_DEFAULT_PATH[user.role]);
  }

  return (
    <main className="min-h-screen bg-amber-100/30 px-4 py-10 flex flex-col items-center justify-center">
      <ReflectionCard
        label="REFLECTION"
        title="Before We Read"
        body="Think of a time when you worked really hard. How did it make you feel?"
      />
      <div className="mt-8">
        <Button asChild variant="default">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </main>
  );
}
