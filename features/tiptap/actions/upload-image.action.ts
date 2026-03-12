"use server";

import fs from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";
import { logger } from "@/lib/logger";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"] as const;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export type UploadImageResult = { success: true; url: string } | { success: false; error: string };

export async function uploadImage(formData: FormData): Promise<UploadImageResult> {
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { success: false, error: "No file uploaded" };
  }

  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return { success: false, error: "Invalid file type" };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { success: false, error: "File too large (max 5MB)" };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create Sharp instance and ensure proper cleanup
    const sharpInstance = sharp(buffer);
    const optimized = await sharpInstance
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();

    // Explicitly destroy the Sharp instance to free up resources
    sharpInstance.destroy();

    const fileName = `${Date.now()}.webp`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const uploadPath = path.join(uploadDir, fileName);

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(uploadPath, optimized);

    return { success: true, url: `/uploads/${fileName}` };
  } catch (err) {
    logger.error({ err }, "uploadImage error:");
    return { success: false, error: "Upload failed" };
  }
}
