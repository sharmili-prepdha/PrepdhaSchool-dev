import Link from "next/link";
import { fetchSchoolsWithContent } from "@/lib/contentMetadata/data";
import { ContentMetadataTree } from "@/components/superAdmin/contentMetadata/ContentMetadataTree";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function ContentMetadataPage() {
  const schools = await fetchSchoolsWithContent();

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/superadmin"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Page Metadata</h1>
            <p className="text-sm text-muted-foreground">Textbooks, chapters, pages</p>
          </div>
        </div>
        <Link href="/editor">
          <Button size="sm" variant="outline">Editor</Button>
        </Link>
      </div>

      <ContentMetadataTree schools={schools}  />
    </div>
  );
}
