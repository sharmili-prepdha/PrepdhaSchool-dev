import { NextResponse } from "next/server";
import { uploadImage } from "@/features/tiptap/actions/upload-image.action";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const result = await uploadImage(formData);

    if (!result.success) {
      logger.warn(`Image upload failed: ${result.error}`);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    logger.error(`Unexpected error in image upload API: ${error}`);

    return NextResponse.json(
      { error: "Something went wrong while uploading the image." },
      { status: 500 },
    );
  }
}
