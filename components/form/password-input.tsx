"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type Props = {
  name: string;
  placeholder?: string;
};

export default function PasswordInput({ name, placeholder = "Password" }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg
                border border-gray-300
                bg-gray-50
                focus:outline-none
                focus:ring-2 focus:ring-black
                focus:bg-white
                transition
                text-sm"
        required
      />

      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  );
}

export function PasswordInputWithBlockCopyPaste({ name, placeholder }: Props) {
  const [show, setShow] = useState(false);

  const blockCopyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        required
        className="w-full px-3 py-2.5 rounded-lg
                border border-gray-300
                bg-gray-50
                focus:outline-none
                focus:ring-2 focus:ring-black
                focus:bg-white
                transition
                text-sm"
        onCopy={blockCopyPaste}
        onPaste={blockCopyPaste}
        onCut={blockCopyPaste}
        onContextMenu={(e) => e.preventDefault()} // disables right-click
      />

      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  );
}
