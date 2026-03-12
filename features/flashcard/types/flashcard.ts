import { Flashcard } from "@/app/generated/prisma/client";

export interface QuestionContent {
    text: string;
    type: string;
    [key: string]: string | number | boolean | null | undefined;
}

export interface AnswerContent {
    correct: string;
    explanation?: string;
    [key: string]: string | number | boolean | null | undefined;
}

export interface FlashcardCommonProps {
    currentCard: Flashcard;
    onEdit: (card: Flashcard) => void;
    currentCardIndex: number;
    flashcardLength: number;
    onReveal: () => void;
    onFlipBack?: () => void;
    onEditActive: () => void;
    onDelete: () => void;
    onEditCancel: () => void;
    isEditing: boolean;
    cardClassName?: string;
    headerAccentClassName?: string;
    handleAccuracy: () => number;
    isRepeat?: boolean;
}
