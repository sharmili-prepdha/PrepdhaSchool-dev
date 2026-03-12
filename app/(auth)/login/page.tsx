import LoginForm from "@/features/auth/forms/login-form";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/auth";
import { ROLE_DEFAULT_PATH } from "@/lib/auth/route-config";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ passwordChanged?: string }>;
}) {
  const user = await getAuthUser();
  if (user) {
    redirect(ROLE_DEFAULT_PATH[user.role]);
  }
  const { passwordChanged } = await searchParams;
  return <LoginForm showPasswordChangedMessage={!!passwordChanged} />;
}
