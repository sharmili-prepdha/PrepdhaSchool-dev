"use client";

import { useState, useRef, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { ImageIcon, Upload, Link as LinkIcon, X, Check, AlertCircle } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  validateImageFile,
  compressImage,
  type CompressionFailure,
  type CompressionSuccess,
} from "@/features/question-cards/lib/image-compression";

interface ImageBtnDialogProps {
  editor: Editor;
}

type TabType = "upload" | "url";

export function ImageBtnDialog({ editor }: ImageBtnDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("upload");

  // Upload tab state
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedBase64, setCompressedBase64] = useState<string | null>(null);
  const [sizeKB, setSizeKB] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL tab state
  const [urlInput, setUrlInput] = useState("");
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const resetState = () => {
    setPreview(null);
    setCompressedBase64(null);
    setSizeKB(null);
    setIsDragging(false);
    setUploadError(null);
    setIsProcessing(false);
    setUrlInput("");
    setUrlPreview(null);
    setUrlError(null);
    setActiveTab("upload");
  };

  const handleClose = () => {
    setOpen(false);
    resetState();
  };

  // --- Upload Tab Logic ---

  const processFile = useCallback(async (file: File) => {
    setUploadError(null);
    setIsProcessing(true);
    setPreview(null);
    setCompressedBase64(null);

    // Validate
    const validationError = validateImageFile(file);
    if (validationError) {
      setUploadError(validationError);
      setIsProcessing(false);
      return;
    }

    // Compress
    const result = await compressImage(file);
    if (result.success) {
      const success = result as CompressionSuccess;
      setPreview(success.base64);
      setCompressedBase64(success.base64);
      setSizeKB(success.sizeKB);
    } else {
      const failure = result as CompressionFailure;
      setUploadError(failure.error); // no error
    }
    setIsProcessing(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clearUpload = () => {
    setPreview(null);
    setCompressedBase64(null);
    setSizeKB(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- URL Tab Logic ---

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    setUrlError(null);
    setUrlPreview(val.trim() ? val.trim() : null);
  };

  const handleUrlImageError = () => {
    setUrlPreview(null);
    setUrlError("Could not load image from this URL. Please check the link.");
  };

  // --- Insert Logic ---

  //   const insertImage = () => {
  //     if (activeTab === "upload" && compressedBase64) {
  //       editor.chain().focus().setImage({ src: compressedBase64 }).run();
  //       handleClose();
  //     } else if (activeTab === "url" && urlInput.trim()) {
  //       const src =
  //         urlInput.startsWith("http://") || urlInput.startsWith("https://")
  //           ? urlInput.trim()
  //           : `https://${urlInput.trim()}`;
  //       editor.chain().focus().setImage({ src }).run();
  //       handleClose();
  //     }
  //   };

  const insertImage = () => {
    if (activeTab === "upload" && compressedBase64) {
      editor.chain().focus().setImage({ src: compressedBase64 }).run();
      handleClose();
    } else if (activeTab === "url" && urlInput.trim()) {
      const src =
        urlInput.startsWith("http://") || urlInput.startsWith("https://")
          ? urlInput.trim()
          : `https://${urlInput.trim()}`;

      // Test if image loads in editor context before inserting
      const testImg = new Image();
      testImg.crossOrigin = "anonymous"; // simulate editor context
      testImg.onload = () => {
        editor.chain().focus().setImage({ src }).run();
        handleClose();
      };
      testImg.onerror = () => {
        setUrlError(
          "This image URL is blocked by CORS. Please download the image and upload it directly instead.",
        );
      };
      testImg.src = src;
    }
  };

  const canInsert =
    (activeTab === "upload" && !!compressedBase64) ||
    (activeTab === "url" && !!urlInput.trim() && !urlError);

  return (
    <>
      <Toggle aria-label="Insert image" onPressedChange={() => setOpen(true)}>
        <ImageIcon className="h-4 w-4" />
      </Toggle>

      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (!val) handleClose();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
            <TabsList className="w-full">
              <TabsTrigger value="upload" className="flex-1 gap-2">
                <Upload className="h-4 w-4" />
                Upload from Device
              </TabsTrigger>
              <TabsTrigger value="url" className="flex-1 gap-2">
                <LinkIcon className="h-4 w-4" />
                Image URL
              </TabsTrigger>
            </TabsList>

            {/* ── Upload Tab ── */}
            <TabsContent value="upload" className="mt-4 space-y-3">
              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !preview && fileInputRef.current?.click()}
                className={`
                  relative w-full rounded-md border-2 border-dashed transition-colors
                  ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"}
                  ${preview ? "cursor-default" : "cursor-pointer"}
                `}
                style={{ aspectRatio: "16/9" }}
              >
                {isProcessing ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-xs">Compressing...</span>
                  </div>
                ) : preview ? (
                  <>
                    {/* Preview image */}
                    <img
                      src={preview}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-contain rounded-md p-1"
                    />
                    {/* Clear button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearUpload();
                      }}
                      className="absolute top-1.5 right-1.5 rounded-full bg-background/80 p-1 shadow hover:bg-destructive hover:text-white transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {/* Size badge */}
                    {sizeKB && (
                      <span className="absolute bottom-1.5 right-1.5 rounded-md bg-background/80 px-2 py-0.5 text-xs text-muted-foreground shadow">
                        {sizeKB}KB (WebP)
                      </span>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Upload className="h-8 w-8 opacity-40" />
                    <p className="text-sm font-medium">
                      {isDragging ? "Drop image here" : "Click or drag & drop"}
                    </p>
                    <p className="text-xs opacity-60">JPG, PNG, WebP · Max 2MB</p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Error */}
              {uploadError && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-2 text-destructive text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {uploadError}
                </div>
              )}
            </TabsContent>

            {/* ── URL Tab ── */}
            <TabsContent value="url" className="mt-4 space-y-3">
              <Input
                autoFocus
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={handleUrlChange}
                onKeyDown={(e) => e.key === "Enter" && canInsert && insertImage()}
                className="text-sm"
              />

              {/* URL preview */}
              <div
                className="w-full rounded-md border-2 border-dashed border-muted-foreground/30 overflow-hidden bg-muted/20"
                style={{ aspectRatio: "16/9" }}
              >
                {urlPreview ? (
                  <img
                    src={urlPreview}
                    alt="Preview"
                    onError={handleUrlImageError}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    Image preview
                  </div>
                )}
              </div>

              {urlError && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-2 text-destructive text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {urlError}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={insertImage} disabled={!canInsert}>
              <Check className="h-3 w-3 mr-1" />
              Insert
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
