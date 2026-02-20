# WWBAM Public Display App — Build Brief

## 1. What This App Is

A **standalone, read-only public display** for the WWBAM (Who Wants to Be a Millionaire) quiz
competition system. It is shown on a TV/projector during a live game event.

- It has **zero user interaction** — audience only watches
- It **only reads from Firebase** — never writes
- It is **completely separate** from the host panel app
- It reacts in real-time to whatever the host does in the host panel

---

## 2. Relationship to the Host Panel

The host panel is a separate React app (separate GitHub repo) that manages the game.
The display app simply **listens to the same Firebase Realtime Database** and renders
whatever state the host pushes.

**Host panel tech stack (for reference):**

- React 19 + Vite + Tailwind CSS 4
- Zustand (state management)
- Firebase Realtime Database + Firebase Auth
- pnpm
- Infisical for environment variables
- Node.js >= 22.0.0

---

## 3. Display App Tech Stack

| Concern         | Choice                   | Reason                                                                      |
| --------------- | ------------------------ | --------------------------------------------------------------------------- |
| Framework       | React 19 + Vite          | Consistent with host panel; component model handles conditional UI well     |
| Styling         | Tailwind CSS 4           | Utility-first; handles the dark TV aesthetic cleanly                        |
| Animations      | Framer Motion            | `variants` + `staggerChildren` perfect for option reveal sequences          |
| State           | `useState` + `useEffect` | No Zustand needed — app is purely reactive, no actions                      |
| Auth            | Firebase Anonymous Auth  | Required to satisfy Firebase security rules (all nodes need `auth != null`) |
| Package manager | pnpm                     | Consistent with host panel                                                  |

**No router needed** — single page, screen switching handled via conditional rendering based on `gameStatus`.

---

## 4. Firebase Project Details

The display app connects to the **same Firebase project** as the host panel: `wwbam-quiz`

**Three database environments:**

| Environment | Database Instance             | When used   |
| ----------- | ----------------------------- | ----------- |
| Production  | `wwbam-quiz-default-rtdb`     | Live events |
| Staging     | `wwbam-quiz-staging`          | Testing     |
| Local Dev   | Firebase Emulator (port 9000) | Development |

**Environment detection:** via `VITE_ENVIRONMENT` variable

```
VITE_ENVIRONMENT=development  → Firebase Emulator
VITE_ENVIRONMENT=staging      → wwbam-quiz-staging
VITE_ENVIRONMENT=production   → wwbam-quiz-default-rtdb
```

**Authentication:** Anonymous sign-in (`signInAnonymously()`). No email/password. No UI needed.
The anonymous auth satisfies the `auth != null` check in Firebase security rules without
exposing any credentials.

---

## 5. Firebase Security Rules (existing, no changes needed)

```json
{
  "rules": {
    "allowed-hosts": { ".read": "auth != null", ".write": false },
    "question-sets": {
      ".read": "auth != null && root.child('allowed-hosts').child(auth.uid).exists()",
      ".write": "auth != null && root.child('allowed-hosts').child(auth.uid).exists()"
    },
    "game-state": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('allowed-hosts').child(auth.uid).exists()"
    },
    "teams": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('allowed-hosts').child(auth.uid).exists()"
    },
    "prize-structure": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('allowed-hosts').child(auth.uid).exists()"
    },
    "config": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('allowed-hosts').child(auth.uid).exists()"
    }
  }
}
```

The display app only needs **read access** — anonymous auth grants that without touching write rules.

---

## 6. Firebase Database Schema (read-only, what the display consumes)

**Key naming convention:** Firebase stores keys in `kebab-case`. JavaScript uses `camelCase`.
The display app must convert kebab-case → camelCase when reading from Firebase.

### `game-state` node — primary driver of the display

| Firebase key              | JS key                  | Type         | Notes                                                                 |
| ------------------------- | ----------------------- | ------------ | --------------------------------------------------------------------- |
| `game-status`             | `gameStatus`            | string       | `not-started` \| `initialized` \| `active` \| `paused` \| `completed` |
| `current-team-id`         | `currentTeamId`         | string\|null | ID of the team currently playing                                      |
| `current-question-number` | `currentQuestionNumber` | number       | 1–20                                                                  |
| `current-question`        | `currentQuestion`       | object\|null | Question object — **no correct answer**                               |
| `question-visible`        | `questionVisible`       | boolean      | Whether to show the question                                          |
| `options-visible`         | `optionsVisible`        | boolean      | Whether to show answer options                                        |
| `answer-revealed`         | `answerRevealed`        | boolean      | Whether to highlight correct answer                                   |
| `correct-option`          | `correctOption`         | string\|null | `"A"` \| `"B"` \| `"C"` \| `"D"`                                      |
| `active-lifeline`         | `activeLifeline`        | string\|null | `"phone-a-friend"` \| `"fifty-fifty"` \| `null`                       |
| `play-queue`              | `playQueue`             | array        | Ordered array of team IDs                                             |
| `display-final-results`   | `displayFinalResults`   | boolean      | Trigger for results screen                                            |

**`current-question` object structure (no correct answer — intentionally omitted by host):**

```json
{
  "id": "q5",
  "number": 5,
  "text": "What is the capital of France?",
  "options": {
    "A": "London",
    "B": "Paris",
    "C": "Berlin",
    "D": "Rome"
  }
}
```

### `teams` node

Each team is keyed by team ID (e.g. `team-1`):

| Firebase key          | JS key               | Type   | Notes                                                |
| --------------------- | -------------------- | ------ | ---------------------------------------------------- |
| `name`                | `name`               | string | Team display name                                    |
| `participants`        | `participants`       | string | Comma-separated names                                |
| `status`              | `status`             | string | `waiting` \| `active` \| `eliminated` \| `completed` |
| `current-prize`       | `currentPrize`       | number | Prize amount in Rs.                                  |
| `lifelines-available` | `lifelinesAvailable` | object | `{ phoneAFriend: bool, fiftyFifty: bool }`           |

### `prize-structure` node

Simple array of numbers. Index 0 = Question 1, Index 19 = Question 20.

```json
[500, 1000, 1500, 2000, 3000, 5000, 7500, 10000, ...]
```

### `config/display-settings` node

| Firebase key         | JS key              | Type    | Default    |
| -------------------- | ------------------- | ------- | ---------- |
| `show-prize-ladder`  | `showPrizeLadder`   | boolean | `true`     |
| `show-team-list`     | `showTeamList`      | boolean | `true`     |
| `animation-duration` | `animationDuration` | number  | `500` (ms) |

---

## 7. Screen Logic

The display shows different screens based on Firebase state:

```
Firebase state                          → Screen shown
─────────────────────────────────────────────────────
Connecting / anonymous auth pending     → LoadingScreen
gameStatus: "not-started"               → IdleScreen
gameStatus: "initialized"               → IdleScreen
gameStatus: "active"                    → GameScreen
gameStatus: "paused"                    → GameScreen (with pause overlay)
gameStatus: "completed"                 → GameScreen (until displayFinalResults)
displayFinalResults: true               → ResultsScreen
```

---

## 8. Visual Design — Authentic WWBAM Aesthetic

**The goal is to replicate the real TV show look.**

### Colour palette

```
Background:       #0a0a2e  (deep navy)
Card/panel:       #0d1b4b  (slightly lighter navy)
Primary glow:     #1a3a8f  (blue glow for default state)
Option default:   gradient from #0d1b4b to #1a3a8f
Option selected:  #b45309  (amber/orange — "thinking" state)
Option correct:   #15803d  (green — answer revealed correct)
Option wrong:     #b91c1c  (red — answer revealed wrong)
Text primary:     #ffffff
Text secondary:   #94a3b8
Gold accent:      #f59e0b  (prize amounts, milestone markers)
```

### Typography

- Font: `Roboto` or `Inter` — clean, readable at distance on TV
- Question text: large, bold, centred
- Option label (A/B/C/D): prominent, slightly larger than option text

### Layout (16:9 full screen — designed for TV/projector)

```
┌─────────────────────────────────────────────────────┐
│  TOP BAR: Team name | Q number | Current prize       │
├───────────────────────────────────┬─────────────────┤
│                                   │                 │
│   QUESTION CARD (centred)         │  PRIZE LADDER   │
│                                   │  (scrollable)   │
│   ┌─────────────────────────┐     │                 │
│   │  A: Option text         │     │  Q20  Rs.XXXXX  │
│   │  B: Option text         │     │  Q19  Rs.XXXXX  │
│   └─────────────────────────┘     │  ...            │
│   ┌─────────────────────────┐     │► Q5   Rs.XXXXX  │
│   │  C: Option text         │     │  ...            │
│   │  D: Option text         │     │  Q1   Rs.500    │
│   └─────────────────────────┘     │                 │
│                                   ├─────────────────┤
│                                   │  TEAM LIST      │
│                                   │  (if enabled)   │
└───────────────────────────────────┴─────────────────┘
```

### Option button shape

The authentic WWBAM look uses a **wide hexagon / elongated diamond** shape.
Achieved with CSS `clip-path`:

```css
clip-path: polygon(2% 0%, 98% 0%, 100% 50%, 98% 100%, 2% 100%, 0% 50%);
```

### Animation sequence (Framer Motion)

1. **Question entrance:** question card fades + slides up
2. **Options entrance:** each option staggers in (A → B → C → D) with 150ms delay each
3. **Answer selected (host locked):** selected option pulses amber
4. **Reveal sequence:**
   - Brief pause (suspense)
   - Correct option flashes → settles green
   - Wrong option (if selected wrong) flashes red
5. **Screen transitions:** fade between screens (0.5s)
6. **Prize ladder:** smooth scroll to current question highlight

---

## 9. Proposed File Structure

```
wwbam-display/
├── package.json
├── vite.config.js
├── index.html
├── .env.example
│
└── src/
    ├── main.jsx                         # Entry point
    ├── App.jsx                          # Anonymous auth + screen router
    │
    ├── config/
    │   └── firebase.js                  # Firebase init + anonymous auth + emulator support
    │
    ├── hooks/
    │   ├── useFirebaseAuth.js           # Anonymous sign-in, connection/auth state
    │   ├── useGameState.js              # onValue listener: game-state node
    │   ├── useTeams.js                  # onValue listener: teams node
    │   ├── usePrizeStructure.js         # onValue listener: prize-structure node
    │   └── useDisplayConfig.js         # onValue listener: config/display-settings
    │
    ├── screens/
    │   ├── LoadingScreen.jsx            # Connecting to Firebase / auth pending
    │   ├── IdleScreen.jsx               # not-started / initialized states
    │   ├── GameScreen.jsx               # Active gameplay — main screen
    │   └── ResultsScreen.jsx            # displayFinalResults = true
    │
    ├── components/
    │   ├── question/
    │   │   ├── QuestionCard.jsx         # Question text display
    │   │   └── OptionGrid.jsx           # 2x2 A/B/C/D options with reveal states
    │   ├── sidebar/
    │   │   ├── PrizeLadder.jsx          # Vertical prize list, current Q highlighted
    │   │   └── TeamList.jsx             # All teams with status badges
    │   └── topbar/
    │       ├── TeamInfoBar.jsx          # Current team name, participants, prize
    │       └── LifelineIndicator.jsx    # Phone/50-50 availability badges
    │
    └── utils/
        ├── formatters.js               # formatPrize(amount), formatPrizeShort(amount)
        └── transforms.js              # kebab-case → camelCase Firebase key conversion
```

---

## 10. Key Implementation Notes

### Anonymous auth flow

```javascript
// On app mount — before rendering anything
import { signInAnonymously } from 'firebase/auth';

const { user, loading } = useFirebaseAuth();
// Show LoadingScreen until user is not null
// Then start Firebase listeners
```

### Firebase listener pattern (used in every hook)

```javascript
import { ref, onValue } from 'firebase/database';

useEffect(() => {
  const nodeRef = ref(database, 'game-state');
  const unsubscribe = onValue(nodeRef, (snapshot) => {
    if (snapshot.exists()) {
      setGameState(transformKeys(snapshot.val())); // kebab → camelCase
    }
  });
  return () => unsubscribe(); // cleanup on unmount
}, []);
```

### kebab-case → camelCase conversion

All Firebase keys arrive as kebab-case. The `transforms.js` utility converts them:

```javascript
// 'game-status' → 'gameStatus'
// 'current-team-id' → 'currentTeamId'
// 'question-visible' → 'questionVisible'
const kebabToCamel = (str) =>
  str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
```

### Option reveal state machine

Each option button has one of these visual states:

```
'default'   → dark blue, no highlight
'selected'  → amber/orange (host has locked this answer, awaiting reveal)
'correct'   → green (answerRevealed = true, this is the correct option)
'wrong'     → red (answerRevealed = true, this was selected but is wrong)
'dimmed'    → greyed out (answerRevealed = true, neither selected nor correct)
'removed'   → hidden (50/50 lifeline removed this option)
```

State is derived from: `answerRevealed`, `correctOption`, `selectedOption`, `activeLifeline`

### Prize ladder scroll behaviour

The prize ladder should auto-scroll so the current question level is always visible
and highlighted. Use a `ref` on the current item + `scrollIntoView` when
`currentQuestionNumber` changes.

### Milestone questions

Questions 5, 10, 15, 20 are milestone (safe haven) questions — highlight them
differently on the prize ladder (gold colour, trophy icon).

---

## 11. Environment Variables (.env.example)

```env
VITE_ENVIRONMENT=development

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Same Firebase project credentials as the host panel.
`VITE_FIREBASE_DATABASE_URL` changes per environment (production / staging / emulator).

---

## 12. Dependencies

```json
{
  "dependencies": {
    "firebase": "^11.x",
    "framer-motion": "^11.x",
    "react": "^19.x",
    "react-dom": "^19.x"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.x",
    "autoprefixer": "^10.x",
    "tailwindcss": "^4.x",
    "vite": "^6.x"
  }
}
```

No Zustand. No React Router. No shadcn/ui (build everything custom to match the TV aesthetic).

---

## 13. What NOT to Build

- No login screen (anonymous auth is invisible)
- No host controls of any kind
- No write operations to Firebase
- No local storage / persistence (always fresh from Firebase)
- No mobile responsiveness needed (it's a TV/projector display, always 16:9 landscape)
