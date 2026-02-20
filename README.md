# WWBAM Public Display

Read-only display app for the WWBAM quiz competition. Shown on a TV/projector during live events — no user interaction, purely reactive to the host panel via Firebase Realtime Database.

---

## Quick Start

**Prerequisites:** Node.js >= 22, pnpm, Infisical CLI

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

> `pnpm dev` uses Infisical to inject environment variables. Make sure you're authenticated (`infisical login`) and the project is linked.

---

## Local Development

This app connects to the **Firebase Emulator started by the host-panel project** — it does not run its own emulator.

```bash
# In the host-panel repo, start the emulator first:
pnpm emulator

# Then in this repo:
pnpm dev
```

Emulator ports (must match host-panel's `firebase.json`):

| Service  | Port |
| -------- | ---- |
| Auth     | 9099 |
| Database | 9000 |

---

## Firebase Setup (one-time, per project)

**Anonymous Authentication must be enabled in the Firebase Console**, otherwise you'll see:

```
Auth failed: Firebase: Error (auth/admin-restricted-operation).
```

Enable it at: **Firebase Console → Authentication → Sign-in method → Anonymous → Enable**

Do this for both **Production** and **Staging** environments.

---

## Environments

Controlled by `VITE_ENVIRONMENT` (injected via Infisical or CI secrets):

| `VITE_ENVIRONMENT` | Firebase Target            | When            |
| ------------------ | -------------------------- | --------------- |
| `development`      | Emulator (localhost)       | Local dev       |
| `staging`          | `wwbam-quiz-staging`       | PR preview      |
| `production`       | `wwbam-quiz-default-rtdb`  | Live events     |

---

## Deployment

CI handles deployment automatically:

- **PR to `main`** → staging preview (Firebase Hosting preview channel)
- **Merge to `main`** → production → https://wwbam-quiz-display.web.app

Manual deploy:

```bash
pnpm deploy:firebase
```