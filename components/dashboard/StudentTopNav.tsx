import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBolt, faBullseye } from '@fortawesome/free-solid-svg-icons';
import { Input } from "@/components/ui/core-input";
import { Badge } from "@/components/ui/core-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/core-Avatar";
import { Button } from "@/components/ui/core-button";
import { getAuthUser } from '@/lib/auth/auth';
import { getCachedUserSessionData } from '@/lib/students/global';

export async function StudentTopNav() {
    const session = await getAuthUser();
    let totalXp = 0;

    if (session) {
        const data = await getCachedUserSessionData(session.userId, session.schoolId);
        totalXp = data.totalXp;
    }

    return (
        <header className="fixed top-0 w-full h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-50">
            {/* Logo */}
            <div className="flex items-center gap-2">
                {/* Placeholder for the purple logo block from the design */}
                <div className="w-6 h-6 bg-purple-600 rounded-md"></div>
                <span className="text-xl font-bold tracking-tight text-slate-800">Prepdha</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-2xl mx-12">
                <div className="relative">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Search for keywords, topic, chapter, anything."
                        className="w-full pl-10 pr-4 h-9 bg-slate-50 border-slate-200 rounded-md text-sm shadow-sm placeholder:text-slate-400 focus-visible:ring-purple-600"
                    />
                </div>
            </div>

            {/* Right Nav Options */}
            <div className="flex items-center gap-3">
                <Badge variant="outline" className="h-8 px-3 gap-1.5 border-blue-200 bg-blue-50 text-blue-600 rounded-md">
                    <FontAwesomeIcon icon={faBolt} className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{totalXp} XP</span>
                </Badge>

                <Badge variant="outline" className="h-8 px-3 gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-600 rounded-md">
                    <FontAwesomeIcon icon={faBullseye} className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs font-bold">90%</span>
                </Badge>

                <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 rounded-full text-slate-700">
                    <span className="font-serif italic font-semibold text-sm leading-none">Aa</span>
                </Button>

                <Avatar className="h-8 w-8 border border-slate-200 ring-2 ring-white">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold text-xs">You</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
