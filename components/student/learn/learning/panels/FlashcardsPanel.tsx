import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone } from '@fortawesome/free-solid-svg-icons';

export function FlashcardsPanel() {
    return (
        <>
            <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-100 bg-blue-50/50">
                
                <span className="font-semibold text-900">Flashcards</span>
            </div>
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                <h3 className="font-bold text-slate-900 text-lg mb-2">This is the Flashcards Panel</h3>
               
            </div>
        </>
    );
}
