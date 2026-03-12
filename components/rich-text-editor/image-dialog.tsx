import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (url: string) => void;
}

export function ImageDialog({
    open,
    onOpenChange,
    onSubmit,
}: ImageDialogProps) {
    const [url, setUrl] = useState("");

     const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            setUrl(""); // Reset safely here instead of useEffect
        }
        onOpenChange(nextOpen);
    };

    const handleSubmit = () => {
        if (!url.trim()) return;
        onSubmit(url);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Insert Image</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="image-url">Image URL</Label>
                        <Input
                            id="image-url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/image.png"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Insert</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
