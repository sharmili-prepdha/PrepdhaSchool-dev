import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faClone, faComment, faFileAlt, faPen } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/core-button';
import Link from 'next/link';
import { ChatPanel } from './chatPanel';
import { FlashcardsPanel } from './FlashcardsPanel';
import { DiscussionPanel } from './DiscussionPanel';
import { NotesPanel } from './NotesPanel';
import { EditPanel } from './EditPanel';

type Tab = 'chat' | 'flashcards' | 'discussion' | 'notes' | 'edit';

type Props = {
    activeTab: Tab;
};

const tabs: { id: Tab; icon: typeof faMessage }[] = [
    { id: 'chat', icon: faMessage },
    { id: 'flashcards', icon: faClone },
    { id: 'discussion', icon: faComment },
    { id: 'notes', icon: faFileAlt },
    { id: 'edit', icon: faPen },
];

export function RightContentPanel({ activeTab }: Props) {
    return (
        <div className="w-[380px] shrink-0 flex flex-col gap-4">

            <div className="flex gap-2 w-full">
                {tabs.map(({ id, icon }) => (
                    <Button
                        key={id}
                        asChild
                        variant={activeTab === id ? 'default' : 'outline'}
                        size="icon"
                        className={`flex-1 h-11 rounded-xl shadow-sm ${activeTab === id
                            ? 'bg-purple-600 hover:bg-purple-700 text-white border-0'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <Link href={`?tab=${id}`} scroll={false}>
                            <FontAwesomeIcon icon={icon} className="w-5 h-5" />
                        </Link>
                    </Button>
                ))}
            </div>

            <div
                className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden"
                style={{ minHeight: '600px' }}
            >
                {activeTab === 'chat' && <ChatPanel />}
                {activeTab === 'flashcards' && <FlashcardsPanel />}
                {activeTab === 'discussion' && <DiscussionPanel />}
                {activeTab === 'notes' && <NotesPanel />}
                {activeTab === 'edit' && <EditPanel />}
            </div>

        </div>
    );
}
