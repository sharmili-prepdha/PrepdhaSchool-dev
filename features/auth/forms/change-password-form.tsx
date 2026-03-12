"use client";

import { useActionState } from "react";
import ErrorMessage from "@/components/form/error-message";
import { PasswordInputWithBlockCopyPaste } from "@/components/form/password-input";
import { changePasswordAction } from "@/features/auth/actions/change-password.action";
import { logger } from "@/lib/logger";
import { Loader2, GraduationCap } from "lucide-react";

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, { error: "" });

  if (state.error) {
    logger.error(`Change password submission failed: ${state.error}`);
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
        {/* Logo Section (Same as Login) */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 rounded-full bg-black text-white flex items-center justify-center mb-3">
            <GraduationCap size={26} />
          </div>

          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          <p className="text-xs text-gray-500 mt-1 text-center">Update your account credentials</p>
        </div>

        <form action={formAction} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              New Password <span className="text-gray-400 font-normal">(min 8 characters)</span>
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              maxLength={50}
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
              placeholder="At least 8 characters"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Confirm Password</label>
            <PasswordInputWithBlockCopyPaste
              name="confirmPassword"
              placeholder="Confirm password"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              name="email"
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
              placeholder="Enter your email"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
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
              placeholder="Enter mobile number"
            />
          </div>

          <ErrorMessage message={state.error} />

          {/* Submit Button */}
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
            {isPending ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
