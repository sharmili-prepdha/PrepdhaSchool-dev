"use client";

import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SearchBar() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [term, setTerm] = useState(searchParams.get("q") || "");

    useEffect(() => {
        const handler = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            const currentQuery = params.get("q") || "";

            if (currentQuery === term) return;

            if (term) {
                params.set("q", term);
            } else {
                params.delete("q");
            }
            replace(`${pathname}?${params.toString()}`);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [term, replace, pathname, searchParams]);

    return (
        <div className="px-2 mb-2">
            <Input
                type="search"
                placeholder="Search users..."
                value={term}
                onChange={(e) => setTerm(e.target.value)}
            />
        </div>
    );
}
