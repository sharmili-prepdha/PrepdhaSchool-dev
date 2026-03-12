"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { Badge } from '@/components/ui/core-badge';
import { Button } from '@/components/ui/core-button';
import { markPageReadAction } from '@/features/learning/actions/markPageRead.action';
import { useState, useTransition } from 'react';

type Props = {
    pageId: number;
    pageOrder: number | null;
    contentHtml: string;
    initialIsRead?: boolean;
};

export function PageContentPanel({
    pageId,
    pageOrder,
    contentHtml,
    initialIsRead = false,
}: Props) {
    const [isRead, setIsRead] = useState(initialIsRead);
    const [isPending, startTransition] = useTransition();

    function handleMarkAsRead() {
        if (isRead) return;
        startTransition(async () => {
            const result = await markPageReadAction(pageId);
            if (result.success) {
                setIsRead(true);
            }
        });
    }

    return (
        <div className="flex-1 max-w-3xl flex flex-col gap-6">

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6">

                    {pageOrder != null && (
                        <Badge className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 py-1 border-0 font-bold mb-5 mt-2">
                            <div className="w-1.5 h-1.5 bg-white rounded-full mr-2 opacity-80" />
                            Part {pageOrder}
                        </Badge>
                    )}

                    <div
                        className="prose prose-slate max-w-none px-2"
                        dangerouslySetInnerHTML={{ __html: contentHtml }}
                    />
                </div>

                <div className="px-6 pb-6 flex justify-end">
                    {isRead ? (
                        <Button
                            disabled
                            className="bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl h-10 px-5 font-semibold shadow-none gap-2 cursor-default"
                        >
                            <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4" />
                            Marked as Read
                        </Button>
                    ) : (
                        <Button
                            onClick={handleMarkAsRead}
                            disabled={isPending}
                            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl h-10 px-5 font-semibold shadow-sm gap-2 transition-all"
                        >
                            <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4" />
                            {isPending ? 'Saving…' : 'Mark as Read'}
                        </Button>
                    )}
                </div>
            </div>

        </div>
    );
}
