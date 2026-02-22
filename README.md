# Solo Leveling System Tracker

Minimal, production-ready full-stack app inspired by Solo Leveling progression.

## Stack

- Frontend: React + TypeScript + Vite + Tailwind + React Query + Recharts
- Backend: Fastify + TypeScript + Zod
- Database: Firestore (`firebase-admin`)
- Infra: Docker, Cloud Run (frontend + backend)

## Features Implemented

- Main level from total AP across all categories
- Category-level AP tracking with independent level progression
- Default categories/sub-items exactly as requested:
  - Gym (light/moderate/heavy)
  - IT Knowledge (LeetCode, 1h+ learning)
  - Diet (100g protein, sugary deduction)
  - Lifestyle (wake before 8, morning routine, curious/obsessive)
  - Manual Penalty (Valorant, doomscrolling)
- Automatic logic:
  - Daily streak bonus per category (configurable AP, default `+10`, activates on streak day 2+)
  - Gym miss penalty (`-50`) after two missed non-rest days in a row, with Sunday as default rest day
- Pages:
  - Home (main level + category panels with sub-item quick actions)
  - Level Estimation (level-range XP/AP and estimated days)
  - Category/Sub-item Settings (add/edit/delete, AP tuning)
  - Goals (add/delete reminders)
  - History (current month daily line graph for main + category AP)

## Local Run (No Firestore)

```bash
npm install
npm run dev
```

- API: `http://localhost:8080`
- Web: `http://localhost:5173`

The backend defaults to in-memory store when `USE_IN_MEMORY_DB=true`.

## Local Docker

```bash
docker compose up --build
```

- Web: `http://localhost:5173`
- API: `http://localhost:8080`

## Firestore Setup

1. Create a GCP project and Firestore database (native mode).
2. Give Cloud Run runtime service account Firestore access (`Cloud Datastore User` at minimum).
3. Set `USE_IN_MEMORY_DB=false` in API service env.

## Deploy to Cloud Run

Build and push images to Artifact Registry:

```bash
# from repo root
PROJECT_ID="your-project-id"
REGION="your-region"
REPO="solo-leveling"

gcloud auth configure-docker "$REGION-docker.pkg.dev"

docker build -f apps/api/Dockerfile -t "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/api:latest" .
docker push "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/api:latest"

docker build -f apps/web/Dockerfile --build-arg VITE_API_BASE_URL="https://YOUR_API_URL" -t "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/web:latest" .
docker push "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/web:latest"
```

Deploy:

```bash
gcloud run deploy solo-leveling-api \
  --image "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/api:latest" \
  --platform managed --region "$REGION" --allow-unauthenticated \
  --set-env-vars USE_IN_MEMORY_DB=false

gcloud run deploy solo-leveling-web \
  --image "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/web:latest" \
  --platform managed --region "$REGION" --allow-unauthenticated
```

## Notes

- No login/signup is included (single-user mode).
- AP and level growth parameters are editable in Settings.
- Main and category levels use the same configurable growth curve for simplicity and long-term progression.
