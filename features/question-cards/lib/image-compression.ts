/**
 * imageCompression.ts
 *
 * WHY BASE64 FOR MVP:
 * - No external storage setup needed (no S3, Cloudinary, etc.)
 * - Image lives inside the Tiptap JSON → single DB write
 * - Safe for demo/short-term production
 *
 * WHY RESIZE BEFORE BASE64:
 * - Raw image base64 can be 1–5MB+ which bloats DB fast
 * - Resizing to 600px + WebP at 0.65 quality → typically 20–80KB
 * - Canvas API does this entirely client-side, zero server cost
 *
 * MIGRATION PATH (when ready):
 * - Replace this util with an upload-to-S3/Cloudinary function
 * - Return a URL string instead of base64
 * - Tiptap image node already supports src URLs — zero editor changes needed
 */

const MAX_WIDTH = 600;
const QUALITY = 0.65;
const MAX_ORIGINAL_SIZE_MB = 2;
const MAX_BASE64_KB = 150;

// export type CompressionResult =
//   | { success: true; base64: string; sizeKB: number }
//   | { success: false; error: string };

// extract into named types
export type CompressionSuccess = {
  success: true;
  base64: string;
  sizeKB: number;
};
export type CompressionFailure = { success: false; error: string };
export type CompressionResult = CompressionSuccess | CompressionFailure;

/**
 * Validates file type and size before processing.
 */
export function validateImageFile(file: File): string | null {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return "Only JPG, PNG, and WebP images are allowed.";
  }
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_ORIGINAL_SIZE_MB) {
    return `Image must be under ${MAX_ORIGINAL_SIZE_MB}MB. Your file is ${sizeMB.toFixed(1)}MB.`;
  }
  return null;
}

/**
 * Compresses an image file using canvas:
 * 1. Loads image into a canvas element
 * 2. Resizes to max 600px width (maintaining aspect ratio)
 * 3. Exports as WebP at 0.65 quality
 * 4. Returns base64 string
 */
export function compressImage(file: File): Promise<CompressionResult> {
  return new Promise<CompressionResult>((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Step 1: Calculate new dimensions
        let { width, height } = img;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        // Step 2: Draw onto canvas at new size
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({
            success: false,
            error: "Canvas context unavailable.",
          } satisfies CompressionFailure);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Step 3: Export as WebP (fallback to jpeg if browser doesn't support WebP)
        const webpData = canvas.toDataURL("image/webp", QUALITY);
        const finalData = webpData.startsWith("data:image/webp")
          ? webpData
          : canvas.toDataURL("image/jpeg", QUALITY);

        // Step 4: Check final base64 size
        const base64 = finalData;
        const sizeKB = Math.round((base64.length * 3) / 4 / 1024);

        if (sizeKB > MAX_BASE64_KB) {
          resolve({
            success: false,
            error: `Compressed image is ${sizeKB}KB, which exceeds the ${MAX_BASE64_KB}KB limit. Please use a smaller image.`,
          } satisfies CompressionFailure);
          return;
        }

        resolve({ success: true, base64, sizeKB } satisfies CompressionSuccess);
      };

      img.onerror = () =>
        resolve({ success: false, error: "Failed to load image." } satisfies CompressionFailure);
      img.src = e.target?.result as string;
    };

    reader.onerror = () =>
      resolve({ success: false, error: "Failed to read file." } satisfies CompressionFailure);
    reader.readAsDataURL(file);
  });
}
