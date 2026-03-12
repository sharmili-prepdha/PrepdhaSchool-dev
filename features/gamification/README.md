# Gamification System Documentation

## Overview

The gamification system is designed to work only for students and awards XP points for various activities. Login XP is awarded only once per day.

## XP Rules

- **LOGIN** → +3 XP (once per day)
- **LOGIN_STREAK_3D** → +10 XP (automatically awarded when reaching 3-day streak)
- **REVISION_COMPLETE** → +5 XP
- **NEW_TOPIC_COMPLETE** → +3 XP
- **ANSWER_CORRECT** → +1 XP
- **ANSWER_WRONG** → -1 XP
- **DID_FLASHCARDS** → +8 XP
- **LOGIN_MISSED_7DAYS** → -50 XP

## Setup

1. Run the SQL seed script to populate XP rules:

   ```sql
   -- Execute contents of /scripts/seed-xp-rules.sql
   ```

2. The gamification system is automatically triggered on successful login via `/app/auth/redirect/page.tsx`.

## Usage in Components

### Server-side Usage

```typescript
import { triggerGamificationEvent } from "@/lib/gamification/gamification";

// This will only work for students
await triggerGamificationEvent("ANSWER_CORRECT");
```

### Client-side Usage

```typescript
import { useGamificationEvent } from "@/features/gamification/components/useGamificationEvent";

function MyComponent() {
  const [triggerEvent, { isPending, lastState, error }] = useGamificationEvent();

  const handleCorrectAnswer = () => {
    triggerEvent("ANSWER_CORRECT");
  };

  return (
    <button onClick={handleCorrectAnswer} disabled={isPending}>
      Submit Answer
    </button>
  );
}
```

## Important Notes

- Only students can earn XP. Other roles (teacher, principal, admin, superadmin) are ignored.
- Login XP is awarded only once per calendar day per student.
- **Midnight Cross-Over**: If a student logs in at 11:30 PM and again at 12:30 AM, they will receive XP for both days since these are different calendar days.
- The 3-day streak bonus (+10 XP) is automatically awarded when a student reaches a 3-day streak.
- All gamification events are logged for debugging.
- The system uses database transactions to ensure data consistency.

## Database Schema

- `xp_rules` - Defines XP values for each activity type
- `student_gamification_state` - Tracks each student's XP, streaks, and last active date
