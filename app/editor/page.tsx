"use client";

import { RichTextContent } from "@/components/rich-text-editor/rich-text-content";
import { useCallback, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { type Content, type JSONContent } from "@tiptap/react";
import { loadDocument } from "@/features/tiptap/actions/load-document.action";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

function Editor() {
const router = useRouter();
const searchParams = useSearchParams();
const pageIdParam = searchParams.get("pageId");

const [post, setPost] = useState<Content>("");
const [pageId, setPageId] = useState<number | null>(null);
const [loadError, setLoadError] = useState<string | null>(null);
const [copyFeedback, setCopyFeedback] = useState(false);

useEffect(() => {
const id = pageIdParam ? parseInt(pageIdParam, 10) : NaN;

```
if (!Number.isNaN(id) && id > 0) {
  loadDocument({ pageId: id }).then((result) => {
    if (result.success) {
      setPageId(result.pageId);
      setPost(result.content);
      setLoadError(null);
    } else {
      setLoadError(result.error);
    }
  });
}
```

}, [pageIdParam]);

const handleCopyJson = useCallback(async () => {
const str =
typeof post === "string" ? post : JSON.stringify(post, null, 2);

```
try {
  await navigator.clipboard.writeText(str);
  setCopyFeedback(true);
  setTimeout(() => setCopyFeedback(false), 2000);
} catch {
  setCopyFeedback(false);
}
```

}, [post]);

const jsonString =
typeof post === "string" ? post : JSON.stringify(post, null, 2);

return ( <div className="flex gap-6 p-8"> <div className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col">

```
    {loadError && (
      <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {loadError}
      </div>
    )}

    <div className="mb-4 flex items-center gap-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1"
        onClick={() => router.back()}
      >
        <ChevronLeft className="size-4" />
        Back
      </Button>

      {pageId && (
        <span className="text-sm text-muted-foreground">
          Page ID: {pageId}
        </span>
      )}
    </div>

    <RichTextContent
      key={pageId ?? "new"}
      pageId={pageId ?? 0}
      content={post as JSONContent}
    />

  </div>

  <aside className="sticky top-8 w-[420px] shrink-0 rounded-lg border bg-slate-50">
    <div className="flex items-center justify-between border-b px-3 py-2 text-xs">
      <span>JSON</span>

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

    <pre className="overflow-auto p-4 font-mono text-xs">
      <code className="whitespace-pre-wrap">{jsonString}</code>
    </pre>
  </aside>
</div>
```

);
}

export default function EditorPage() {
return (
<Suspense
fallback={ <div className="flex items-center justify-center min-h-screen">
Loading editor... </div>
}
> <Editor /> </Suspense>
);
}
