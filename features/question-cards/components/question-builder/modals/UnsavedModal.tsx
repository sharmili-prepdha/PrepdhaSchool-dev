"use client";

interface UnsavedModalProps {
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export function UnsavedModal({ onSave, onDiscard, onCancel }: UnsavedModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Unsaved Changes</h2>
        <p className="text-sm text-gray-500 mb-5">
          You have unsaved changes. What would you like to do?
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onSave}
            className="w-full rounded-md bg-black text-white text-sm py-2 hover:bg-gray-800"
          >
            Save changes
          </button>
          <button
            onClick={onDiscard}
            className="w-full rounded-md border text-sm py-2 text-red-500 border-red-200 hover:bg-red-50"
          >
            Discard changes
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-md border text-sm py-2 text-gray-600 hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}