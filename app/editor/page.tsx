"use client";

import RichTextContent from "@/components/rich-text-editor/rich-text-content"
import { useCallback, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { type Content, type JSONContent } from "@tiptap/react";
import { saveDocument } from "@/features/tiptap/actions/save-document.action";
import { loadDocument } from "@/features/tiptap/actions/load-document.action";
import type { TextbookPageMetadata } from "@/types/rich-text.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";

const emptyMetadata: TextbookPageMetadata = {
  grade: null,
  subject: null,
  textbookName: null,
  chapter: null,
  pageNumber: null,
  title: null,
};

function metadataToForm(meta: TextbookPageMetadata) {
  return {
    grade: meta.grade?.toString() ?? "",
    subject: meta.subject ?? "",
    textbookName: meta.textbookName ?? "",
    chapter: meta.chapter ?? "",
    pageNumber: meta.pageNumber?.toString() ?? "",
    title: meta.title ?? "",
  };
}

function Editor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicIdParam = searchParams.get("topicId");
  const pageIdParam = searchParams.get("pageId");
  const topicId = topicIdParam ? parseInt(topicIdParam, 10) : NaN;
  const topicIdValid = !Number.isNaN(topicId) && topicId > 0;

  const [post, setPost] = useState<Content>(() => {
    if (pageIdParam) return "";
    if (topicIdParam) return { type: "doc", content: [] };
    return "";
  });
  const [pageId, setPageId] = useState<number | null>(null);
  const [metaForm, setMetaForm] = useState(metadataToForm(emptyMetadata));
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const idParam = searchParams.get("pageId");
    const id = idParam ? parseInt(idParam, 10) : NaN;
    if (!Number.isNaN(id) && id > 0) {
      loadDocument({ pageId: id }).then((result) => {
        if (result.success) {
          setPageId(result.pageId);
          setPost(result.content);
          setMetaForm(metadataToForm(result.metadata));
          setLoadError(null);
        } else {
          setLoadError(result.error);
        }
      });
    }
  }, [searchParams]);

  const handleCopyJson = useCallback(async () => {
    const str = typeof post === "string" ? post : JSON.stringify(post, null, 2);
    try {
      await navigator.clipboard.writeText(str);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      setCopyFeedback(false);
    }
  }, [post]);

  const onchange = (content: Content) => {
    setPost(content);
  };

  const handleSave = async () => {
    const doc: JSONContent =
      typeof post === "string" ? { type: "doc", content: [] } : (post as JSONContent);
    setSaveStatus("saving");
    setSaveError(null);
    const gradeNum = metaForm.grade ? parseInt(metaForm.grade, 10) : NaN;
    const pageNum = metaForm.pageNumber ? parseInt(metaForm.pageNumber, 10) : NaN;
    const hasMetadata =
      metaForm.grade !== "" &&
      !Number.isNaN(gradeNum) &&
      metaForm.subject !== "" &&
      metaForm.chapter !== "" &&
      metaForm.pageNumber !== "" &&
      !Number.isNaN(pageNum);
    const result = await saveDocument({
      pageId: pageId ?? undefined,
      topicId: !pageId && topicIdValid ? topicId : undefined,
      content: JSON.parse(JSON.stringify(doc)),
      metadata: hasMetadata
        ? {
            grade: gradeNum,
            subject: metaForm.subject,
            textbookName: metaForm.textbookName || undefined,
            chapter: metaForm.chapter,
            pageNumber: pageNum,
            title: metaForm.title || undefined,
          }
        : undefined,
    });
    if (result.success) {
      setPageId(result.pageId);
      setSaveStatus("saved");
      setSaveError(null);
      setTimeout(() => setSaveStatus("idle"), 2000);
      if (!pageId && result.pageId) {
        router.replace(`/editor?pageId=${result.pageId}`, { scroll: false });
      }
    } else {
      setSaveStatus("error");
      setSaveError(result.error);
    }
  };

  const jsonString = typeof post === "string" ? post : JSON.stringify(post, null, 2);
  const jsonSizeBytes = new TextEncoder().encode(jsonString).length;
  const jsonSizeMb = (jsonSizeBytes / 1024 / 1024).toFixed(2);

  return (
    <div className="flex gap-6 p-8">
      <div className="flex min-h-[calc(100vh-4rem)] min-w-0 flex-1 flex-col [&_.ProseMirror]:min-h-[calc(100vh-4rem-140px)]">
        {loadError && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {loadError}
          </div>
        )}
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border bg-slate-50/80 p-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-1 shrink-0 gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => router.back()}
          >
            <ChevronLeft className="size-4" />
            Back
          </Button>
          <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="meta-grade" className="text-xs">Class</Label>
              <Input
                id="meta-grade"
                type="number"
                min={1}
                placeholder="6"
                value={metaForm.grade}
                onChange={(e) => setMetaForm((f) => ({ ...f, grade: e.target.value }))}
                className="h-8 w-16"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="meta-subject" className="text-xs">Subject</Label>
              <Input
                id="meta-subject"
                placeholder="Science"
                value={metaForm.subject}
                onChange={(e) => setMetaForm((f) => ({ ...f, subject: e.target.value }))}
                className="h-8 w-24"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="meta-textbook" className="text-xs">Textbook</Label>
              <Input
                id="meta-textbook"
                placeholder="Textbook name"
                value={metaForm.textbookName}
                onChange={(e) => setMetaForm((f) => ({ ...f, textbookName: e.target.value }))}
                className="h-8 w-32"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="meta-chapter" className="text-xs">Chapter</Label>
              <Input
                id="meta-chapter"
                placeholder="1"
                value={metaForm.chapter}
                onChange={(e) => setMetaForm((f) => ({ ...f, chapter: e.target.value }))}
                className="h-8 w-16"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="meta-page" className="text-xs">Page</Label>
              <Input
                id="meta-page"
                type="number"
                min={1}
                placeholder="1"
                value={metaForm.pageNumber}
                onChange={(e) => setMetaForm((f) => ({ ...f, pageNumber: e.target.value }))}
                className="h-8 w-16"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="meta-title" className="text-xs">Title</Label>
              <Input
                id="meta-title"
                placeholder="Chapter name"
                value={metaForm.title}
                onChange={(e) => setMetaForm((f) => ({ ...f, title: e.target.value }))}
                className="h-8 min-w-[140px]"
              />
            </div>
          </div>
        </div>

        <RichTextEditor
          key={pageId ?? `pending-${pageIdParam ?? "new"}`}
          content={post}
          onchange={onchange}
          toolbarRight={
            <div className="flex items-center gap-2">
              {pageId != null && (
                <span className="text-muted-foreground font-mono text-xs">Page ID: {pageId}</span>
              )}
              {saveStatus === "saved" && (
                <span className="text-muted-foreground text-sm">Saved</span>
              )}
              {saveStatus === "error" && saveError && (
                <span className="text-destructive text-sm">{saveError}</span>
              )}
              <Button type="button" onClick={handleSave} disabled={saveStatus === "saving"}>
                {saveStatus === "saving" ? "Saving…" : "Save"}
              </Button>
            </div>
          }
        />
      </div>
      <aside className="sticky top-8 flex max-h-[calc(100vh-4rem)] w-[420px] shrink-0 flex-col overflow-hidden rounded-lg border bg-slate-50">
        <div className="shrink-0 flex items-center justify-between gap-2 border-b bg-slate-100 px-3 py-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <span>JSON</span>
            <span className="normal-case font-normal text-slate-500">({jsonSizeMb} MB)</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleCopyJson}
          >
            {copyFeedback ? "Copied!" : "Copy"}
          </Button>
        </div>
        <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-900">
          <code className="whitespace-pre-wrap wrap-break-word">{jsonString}</code>
        </pre>
      </aside>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading editor...</div>}>
      <Editor />
    </Suspense>
  );
}