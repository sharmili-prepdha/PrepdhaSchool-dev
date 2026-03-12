import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/core-button";
import { Input } from "@/components/ui/core-input";
import { Badge } from "@/components/ui/core-badge";

export function ChatPanel() {
    return (
        <>
            <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-100">
                <FontAwesomeIcon icon={faMessage} className="text-slate-400 w-4 h-4" />
                <span className="font-semibold text-slate-700">Chat</span>
            </div>

            <div className="flex-1 p-5 pb-2">
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-5 relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-slate-300 rounded-tl-xl -mt-0.5 -ml-0.5"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-slate-300 rounded-tr-xl -mt-0.5 -mr-0.5"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-slate-300 rounded-bl-xl -mb-0.5 -ml-0.5"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-slate-300 rounded-br-xl -mb-0.5 -mr-0.5"></div>

                    <p className="text-sm text-slate-500 leading-relaxed font-medium mb-5">
                        <span className="font-bold text-slate-900">AI Summary:</span> This chapter discusses
                        Sasankas reign and the first major military expedition against him.
                    </p>

                    <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-9 px-4 text-sm font-semibold shadow-sm w-max">
                        Summarize topic
                    </Button>
                </div>
            </div>

            <div className="p-4 bg-white mt-auto">
                <div className="flex gap-2 mb-4 px-1">
                    <Badge variant="outline" className="h-8 rounded-full border-slate-200 bg-white text-slate-600 text-xs font-semibold px-4 cursor-pointer hover:bg-slate-50">
                        List Points
                    </Badge>
                    <Badge variant="outline" className="h-8 rounded-full border-slate-200 bg-white text-slate-600 text-xs font-semibold px-4 cursor-pointer hover:bg-slate-50">
                        Explain like Im five
                    </Badge>
                </div>

                <div className="relative flex items-center">
                    <Input
                        placeholder="Ask anything about this chapter"
                        className="w-full h-12 pl-5 pr-14 rounded-full border-slate-200 bg-white shadow-sm font-medium placeholder:font-normal placeholder:text-slate-400 focus-visible:ring-purple-600"
                    />
                    <Button size="icon" className="absolute right-1.5 h-9 w-9 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm border-0 shrink-0">
                        <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </>
    );
}