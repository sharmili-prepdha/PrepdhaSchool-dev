import Image from "next/image";
import Link from "next/link";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Search, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
interface NavbarProps {
    overallAccuracy?: number | null;
    overallProgress?: number | null;
    xp?: number;
    name?: string;
    currentStreak?: number;
}

export function Navbar({ overallAccuracy = 0, xp = 0, name = "Student" }: NavbarProps) {
    return (
        <nav className="h-[72px] w-full fixed top-0 left-0 z-50 border-b bg-white/95 backdrop-blur-md flex items-center justify-between px-6">
            <div className="flex items-center gap-4 cursor-pointer">
                <Link href="/" className="flex items-center gap-3 w-full">
                    <Image src="/logo.png" width={32} height={32} alt="Prepdha Logo" />
                    <span className="font-extrabold text-[#2d2d2d] text-xl tracking-tight">Prepdha</span>
                </Link>
            </div>

            <div className="flex-1 max-w-2xl mx-12">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <InputGroup className="w-full bg-slate-100/70 border-none rounded-full h-10 overflow-hidden">
                        <InputGroupAddon className="bg-transparent border-none pl-10 text-slate-400">
                            {/* Empty space since icon is absolute */}
                        </InputGroupAddon>
                        <InputGroupInput
                            placeholder="Search for keywords, topic, chapter, anything."
                            className="bg-transparent border-none text-sm placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                        />
                    </InputGroup>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center px-4 py-1.5 gap-2 border border-blue-100 bg-blue-50/80 text-blue-600 rounded-full font-bold text-sm">
                        <Zap className="w-4 h-4 fill-blue-600" />
                        {xp} XP
                    </div>
                    <div className="flex items-center px-4 py-1.5 gap-2 border border-emerald-100 bg-emerald-50/80 text-emerald-600 rounded-full font-bold text-sm">
                        <Target className="w-4 h-4 fill-emerald-600" />
                        {overallAccuracy}%
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">Aa</div>
                        <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-blue-100 shadow-sm cursor-pointer">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
                            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>
        </nav>
    );
}