"use client";

import { useRouter } from "next/navigation";

import { ContentHeader } from "@/components/ContentHeader";
import { PageViewer } from "@/components/PageViewer";
import type { TextbookPageMetadata, UserHighlight } from "@/types/rich-text.types";
import type { JSONContent } from "@tiptap/react";

type PageViewWithHeaderProps = {
  pageId: number;
  content: JSONContent;
  metadata?: TextbookPageMetadata | null;
  highlights?: UserHighlight[];
};

export function PageViewWithHeader({
  pageId,
  content,
  metadata,
  highlights,
}: PageViewWithHeaderProps) {
  const router = useRouter();

  const breadcrumbs =
    metadata?.subject && metadata?.chapter
      ? [metadata.subject, metadata.chapter]
      : metadata?.subject
        ? [metadata.subject]
        : [];

  return (
    <div className="min-h-screen">
      <ContentHeader
        xp={1240}
        progressPercent={80}
        contentXp={54}
        breadcrumbs={breadcrumbs}
        title={metadata?.title ?? undefined}
        needsAttention
        progressValue={65}
        isFavorite={false}
        onBack={() => router.back()}
        userInitials="JD"
      />
      <div className="mx-auto max-w-3xl p-8">
        <PageViewer
          key={pageId}
          content={content}
          highlights={highlights}
          pageId={pageId}
        />
      </div>
    </div>
  );
}
