import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_LABEL } from "@/lib/schoolManagement/imageConfig";
import NewSchoolForm from "./NewSchoolForm";

export default function NewSchool() {
  async function createSchool(prevState: { error?: string }, formData: FormData) {
    "use server";

    const keyword = formData.get("keyword") as string;
    const name = formData.get("name") as string;
    const isActive = formData.get("is_active") === "true";
    const imageFile = formData.get("image_upload");

    const existing = await prisma.school.findUnique({
      where: { keyword },
    });

    if (existing) {
      return { error: "Keyword already exists" };
    }

    let base64Image: string | null = null;
    const isCleared = formData.get("image_upload_cleared") === "true";

    if (imageFile instanceof File && imageFile.size > 0 && !isCleared) {
      if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
        return { error: `Image must be less than ${MAX_IMAGE_SIZE_LABEL}` };
      }

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      base64Image = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
    }

    // Manually compute the next school ID to avoid sequence/constraint issues
    // const maxSchool = await prisma.school.findFirst({
    //   orderBy: { id: "desc" },
    //   select: { id: true },
    // });
    // const nextId = (maxSchool?.id ?? 0) + 1;

    await prisma.school.create({
      data: {
        keyword,
        name,
        is_active: isActive,
        logo_data_url: base64Image,
      },
    });

    revalidatePath("/superadmin/schoolManagement");
    redirect("/superadmin/schoolManagement");
  }

  return <NewSchoolForm action={createSchool} />;
}
