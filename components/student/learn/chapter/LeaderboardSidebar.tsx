import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/core-Avatar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt } from '@fortawesome/free-solid-svg-icons';

export function LeaderboardSidebar() {
    const users = [
        { name: 'Aarav', xp: 1240, isMe: false },
        { name: 'Kael', xp: 1200, isMe: false },
        { name: 'Prince', xp: 1120, isMe: false },
        { name: 'Ramesh', xp: 1022, isMe: false },
        { name: 'You', xp: 964, isMe: true, rank: 24 },
    ];

    return (
        <div className="w-80 shrink-0 flex flex-col gap-8">
            <div>
                <h2 className="text-base font-bold text-slate-800 mb-3">Leaderboards</h2>
                <div className="flex flex-col gap-2">
                    {users.map((u, i) => (
                        <div key={u.name} className={`flex items-center justify-between p-3 rounded-2xl border ${u.isMe ? 'border-purple-500 bg-white ring-2 ring-purple-100' : 'border-slate-200 bg-white'} shadow-sm`}>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-slate-400 w-4 text-center">{u.rank || i + 1}.</span>
                                <Avatar className="w-9 h-9 border border-slate-200">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="bg-slate-100 text-slate-600 text-sm font-bold">{u.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className={`text-sm font-bold ${u.isMe ? 'text-purple-600' : 'text-slate-700'}`}>{u.name}</span>
                            </div>
                            <div className={`text-sm font-bold flex items-center gap-1.5 ${u.isMe ? 'text-purple-600' : 'text-blue-600'}`}>
                                <FontAwesomeIcon icon={faBolt} className="w-3.5 h-3.5" />
                                {u.xp}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-base font-bold text-slate-800 mb-3">Next Achievement</h2>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 text-2xl">
                        🏆
                    </div>
                    <div className="flex flex-col w-full">
                        <h3 className="text-base font-bold text-slate-800">Book Worm</h3>
                        <p className="text-xs font-medium text-slate-500 mb-3">Finish 10 topics in 1 week</p>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full w-[40%]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
