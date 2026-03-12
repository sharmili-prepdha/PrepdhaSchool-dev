"use client";

import { useState, useRef } from "react";
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_LABEL } from "@/lib/schoolManagement/imageConfig";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { X, AlertCircle, UploadCloud } from "lucide-react";

type Props = {
  name: string;
  initialImage?: string | null;
};

export default function ImageUpload({ name, initialImage }: Props) {
  const [preview, setPreview] = useState<string | null>(initialImage ?? null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(`Image is too large. Max allowed: ${MAX_IMAGE_SIZE_LABEL}`);
      setPreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, etc.)");
      return;
    }

    setError(null);
    setIsCleared(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }

  function clearImage() {
    setPreview(null);
    setError(null);
    setIsCleared(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Hidden input to signal server that image was cleared */}
      <input type="hidden" name={`${name}_cleared`} value={isCleared ? "true" : "false"} />

      <div
        className={`relative group border-2 border-dashed rounded-2xl transition-all duration-300 ${
          dragActive
            ? "border-primary bg-primary/5"
            : error
              ? "border-destructive bg-destructive/5"
              : "border-muted-foreground/25 hover:border-primary hover:bg-accent"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleChange}
        />

        {!preview ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div
              className={`w-12 h-12 mb-4 rounded-xl flex items-center justify-center transition-colors ${
                error
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
              }`}
            >
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold">
              {dragActive ? "Drop the logo here" : "Click or drag to upload logo"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports PNG, JPG, or GIF (max {MAX_IMAGE_SIZE_LABEL})
            </p>
          </div>
        ) : (
          <div className="p-4 flex items-center gap-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              <Image
                src={preview}
                alt="Logo preview"
                width={96}
                height={96}
                className="w-full h-full object-cover rounded-xl border shadow-sm"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearImage();
                }}
                className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-md z-20"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Logo Selected</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your school logo is ready to be uploaded.
              </p>
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 mt-2 text-[11px] font-bold uppercase tracking-wider"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Image
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-xs font-bold">{error}</p>
        </div>
      )}
    </div>
  );
}
