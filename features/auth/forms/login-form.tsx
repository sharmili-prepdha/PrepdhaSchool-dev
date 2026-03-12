"use client";

import { useActionState } from "react";
import { loginAction } from "@/features/auth/actions/login.action";
import { logger } from "@/lib/logger";
import ErrorMessage from "@/components/form/error-message";
import PasswordInput from "@/components/form/password-input";
import { Loader2, GraduationCap } from "lucide-react";

export default function LoginForm({
  showPasswordChangedMessage = false,
}: {
  showPasswordChangedMessage?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: "",
  });

  if (state.error) {
    logger.error(`Login form submission failed: ${state.error}`);
  }

  return (
    <div className="w-full flex items-center justify-center px-4">
      <div
        className="
          w-full
          max-w-sm
          bg-white
          rounded-xl
          shadow-md
          border border-gray-200
          p-6
        "
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 rounded-full bg-black text-white flex items-center justify-center mb-3">
            <GraduationCap size={26} />
          </div>

          <h2 className="text-lg font-semibold text-gray-900">Login</h2>
          <p className="text-xs text-gray-500 mt-1 text-center">Secure access to your dashboard</p>
        </div>

        {showPasswordChangedMessage && (
          <p className="mb-4 text-sm text-green-600 text-center rounded-lg bg-green-50 py-2">
            Password updated. Please sign in again.
          </p>
        )}

        <form action={formAction} className="space-y-4">
          {/* School Keyword */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">School Keyword</label>
            <input
              type="text"
              name="schoolKeyword"
              required
              className="
                w-full px-3 py-2.5 rounded-lg
                border border-gray-300
                bg-gray-50
                focus:outline-none
                focus:ring-2 focus:ring-black
                focus:bg-white
                transition
                text-sm
              "
              placeholder="Enter school keyword"
            />
          </div>
          {/* User ID */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Login ID</label>
            <input
              type="text"
              name="loginId"
              required
              className="
                w-full px-3 py-2.5 rounded-lg
                border border-gray-300
                bg-gray-50
                focus:outline-none
                focus:ring-2 focus:ring-black
                focus:bg-white
                transition
                text-sm
              "
              placeholder="Enter your ID"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <PasswordInput name="password" placeholder="Enter password" />
          </div>

          <ErrorMessage message={state.error} />

          <button
            type="submit"
            disabled={isPending}
            className="
              w-full h-10
              flex items-center justify-center gap-2
              bg-black text-white
              rounded-lg
              font-medium
              text-sm
              hover:bg-gray-900
              transition
              disabled:opacity-70
              disabled:cursor-not-allowed
            "
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] text-gray-400">
          © {new Date().getFullYear()} PrepDha Technologies
        </div>
      </div>
    </div>
  );
}
