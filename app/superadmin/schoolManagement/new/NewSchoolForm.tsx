"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useEffect } from "react";
import Form from "next/form";
import ImageUpload from "@/components/ImageUpload";
import { checkKeywordAvailability } from "@/features/schoolManagement/actions/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Loader2, Info, Image as ImageIcon, Rocket } from "lucide-react";

type NewSchoolFormState = { error?: string };

type NewSchoolFormAction = (
  prevState: NewSchoolFormState,
  formData: FormData,
) => Promise<NewSchoolFormState> | NewSchoolFormState;

export default function NewSchoolForm({ action }: { action: NewSchoolFormAction }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<NewSchoolFormState, FormData>(action, {
    error: "",
  });

  // Local state for interactive UI
  const [isActive, setIsActive] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [keywordExists, setKeywordExists] = useState(false);
  const [isCheckingKeyword, setIsCheckingKeyword] = useState(false);

  useEffect(() => {
    if (!keyword || keyword.length < 3) {
      setKeywordExists(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingKeyword(true);
      try {
        const { exists } = await checkKeywordAvailability(keyword);
        setKeywordExists(exists);
      } catch (err) {
        console.error("Failed to check keyword:", err);
      } finally {
        setIsCheckingKeyword(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword]);

  return (
    <div className="p-6 bg-muted/30 min-h-screen flex flex-col items-center">
      {/* Error Message */}
      {state?.error && (
        <div className="w-full max-w-md bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-semibold">{state.error}</p>
        </div>
      )}

      <Card className="w-full max-w-md shadow-xl border-muted">
        <Form action={formAction}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">New School</CardTitle>
            <CardDescription>Onboard a new educational institution</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* SECTION: GENERAL INFO */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2">
                <Info className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  General Information
                </h2>
              </div>

              <div className="space-y-6">
                {/* Keyword Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="keyword"
                    className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
                  >
                    School Keyword
                  </Label>
                  <div className="relative">
                    <Input
                      id="keyword"
                      name="keyword"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="e.g. blossom-high"
                      className={keywordExists ? "border-destructive pr-10" : "pr-10"}
                      required
                    />
                    {isCheckingKeyword && (
                      <div className="absolute right-3 top-2.5">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="min-h-[20px]">
                    {keywordExists && !isCheckingKeyword && (
                      <p className="text-[10px] text-destructive font-bold flex items-center gap-1.5">
                        <AlertCircle className="h-3 w-3" /> THIS KEYWORD IS ALREADY IN USE
                      </p>
                    )}
                    {!keywordExists && keyword.length >= 3 && !isCheckingKeyword && (
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3" /> PERFECT KEYWORD CHOICE
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
                    Full School Name
                  </Label>
                  <Input id="name" name="name" placeholder="Enter official school name" required />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/50">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive_toggle" className="text-sm font-bold cursor-pointer">
                      Status
                    </Label>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                      Enable / Disable school
                    </p>
                  </div>
                  <Switch id="is_active_toggle" checked={isActive} onCheckedChange={setIsActive} />
                  <input type="hidden" name="is_active" value={isActive ? "true" : "false"} />
                </div>
              </div>
            </div>

            <Separator />

            {/* SECTION: BRANDING */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  School Branding
                </h2>
              </div>
              <ImageUpload name="image_upload" />
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-8">
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
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" /> Register School
                </>
              )}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
}
