"use client";

import { useActionState, useState, useEffect } from "react";
import Form from "next/form";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import { updateSchoolAction } from "../../../features/schoolManagement/actions/actions";
import { checkKeywordAvailability } from "@/features/schoolManagement/actions/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { logger } from "@/lib/logger";

type EditSchoolFormProps = {
  school: {
    id: number;
    name: string;
    keyword: string;
    is_active: boolean;
    logo_data_url: string | null;
  };
};

export default function EditSchoolForm({ school }: EditSchoolFormProps) {
  const router = useRouter();
  const updateWithId = updateSchoolAction.bind(null, school.id);
  const [state, formAction, isPending] = useActionState(updateWithId, { error: "" });

  // Local state for interactive UI
  const [isActive, setIsActive] = useState(school.is_active);
  const [keyword, setKeyword] = useState(school.keyword || "");
  const [keywordExists, setKeywordExists] = useState(false);
  const [isCheckingKeyword, setIsCheckingKeyword] = useState(false);

  useEffect(() => {
    if (!keyword || keyword.length < 3 || keyword === school.keyword) {
      setKeywordExists(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingKeyword(true);
      try {
        const { exists } = await checkKeywordAvailability(keyword, school.id);
        setKeywordExists(exists);
      } catch (err) {
        logger.error(`Failed to check keyword: ${err}`);
      } finally {
        setIsCheckingKeyword(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword, school.keyword, school.id]);

  return (
    <div className="p-6 bg-muted/30 min-h-screen flex flex-col items-center">
      {/* Error Message */}
      {state.error && (
        <div className="w-full max-w-md bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-semibold">{state.error}</p>
        </div>
      )}

      <Card className="w-full max-w-md shadow-xl border-muted">
        <Form action={formAction}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">Edit School</CardTitle>
            <CardDescription>Manage institutional settings and branding</CardDescription>
            <div className="flex gap-2 items-center pt-2">
              <Badge variant="outline" className="font-mono text-[10px]">
                ID: {school.id}
              </Badge>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={
                  isActive
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-amber-100 text-amber-800 hover:bg-amber-100 border-none"
                }
              >
                {isActive ? "Active" : "Disabled"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Keyword Field */}
            <div className="space-y-2">
              <Label
                htmlFor="keyword"
                className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
              >
                Keyword
              </Label>
              <Input
                id="keyword"
                name="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. blossom-high"
                className={keywordExists ? "border-destructive focus-visible:ring-destructive" : ""}
                required
              />
              <div className="min-h-5">
                {isCheckingKeyword && (
                  <p className="text-[10px] text-primary flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" /> Checking availability...
                  </p>
                )}
                {keywordExists && !isCheckingKeyword && (
                  <p className="text-[10px] text-destructive font-bold flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3" /> KEYWORD ALREADY TAKEN
                  </p>
                )}
                {!keywordExists &&
                  keyword.length >= 3 &&
                  keyword !== school.keyword &&
                  !isCheckingKeyword && (
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3" /> AVAILABLE
                    </p>
                  )}
              </div>
            </div>

            {/* School Name Field */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
              >
                School Name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={school.name}
                placeholder="Enter official school name"
                required
              />
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/50">
              <div className="space-y-0.5">
                <Label htmlFor="is_active_toggle" className="text-sm font-bold cursor-pointer">
                  Status
                </Label>
                <p className="text-[11px] text-muted-foreground">Enable or disable this school</p>
              </div>
              <Switch id="is_active_toggle" checked={isActive} onCheckedChange={setIsActive} />
              {/* Maintain hidden input for form submission if Switch doesn't provide it */}
              <input type="hidden" name="is_active" value={isActive ? "true" : "false"} />
            </div>

            {/* Logo Upload */}
            <div className="space-y-4 pt-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block border-b pb-2">
                Branding
              </Label>
              <ImageUpload name="image_upload" initialImage={school.logo_data_url} />
            </div>
          </CardContent>

          <CardFooter className="pt-2 flex gap-4 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
              className="flex-1 h-12 text-base font-bold transition-all shadow-md active:scale-[0.98]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || keywordExists}
              className="flex-1 h-12 text-base font-bold transition-all shadow-md active:scale-[0.98]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" /> Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
}
