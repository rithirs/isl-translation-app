# ISL Translator

A mobile app for translating English or Tamil text into Indian Sign Language.

The repository also includes an Express backend in `server/` for translation caching, Gemini gloss extraction, Veo video generation, and Supabase Storage.

## Requirements

- Node.js 24 or newer
- pnpm 10 or newer
- Expo Go for testing on a physical phone
- Xcode and an iOS Simulator for local iOS testing

## First-time setup

From the `ISL-Bridge` folder:

```bash
pnpm install
```

If `pnpm` is not installed, install it once:

```bash
npm install --global pnpm@10.12.1
```

## Open the mobile app

Start the local Expo server:

```bash
pnpm --filter @workspace/isl-translator run dev:local
```

Expo will show a QR code in the terminal.

### Physical phone with Expo Go

1. Install Expo Go on your phone.
2. Make sure the phone and computer use the same Wi-Fi network.
3. Scan the QR code shown in the terminal.

### iOS Simulator

With the Expo server running, press `i` in the terminal. You can also start it directly with:

```bash
pnpm --filter @workspace/isl-translator exec expo start --ios
```

## Useful checks

Run the mobile TypeScript check:

```bash
pnpm --filter @workspace/isl-translator run typecheck
```

Clear Expo's cache if the app shows stale files:

```bash
pnpm --filter @workspace/isl-translator exec expo start --clear
```

## Run the backend API

The backend is an independent pnpm package inside this workspace. From `ISL-Bridge/server`:

```bash
pnpm install --ignore-workspace
cp .env.example .env
```

Fill in these values in `.env`:

```text
PORT=5000
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

Apply `server/src/database/schema.sql` first, then apply `server/src/database/schema_v2.sql` in the Supabase SQL editor. Create a public Storage bucket named `isl-videos`.

For user history, saved translations, Learn ISL signs, and Row Level Security, also apply `server/src/database/schema_features.sql` and `server/src/database/security_policies.sql`.

Start the API in development mode:

```bash
cd server
pnpm run dev
```

The API runs at `http://localhost:5000`. Check it with:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{"status":"ok"}
```

Useful API routes:

- `POST /api/translate` with `{ "text": "Good morning", "language": "en" }`
- `GET /api/history`
- `GET /api/categories`

The translation route requires valid Supabase and Gemini credentials because cache misses run the Gemini/Veo generation pipeline.

## Verify the repository

Run the backend build:

```bash
cd server
pnpm run build
```

Run the mobile typecheck from the repository root:

```bash
pnpm --filter @workspace/isl-translator run typecheck
```

Run the complete workspace checks:

```bash
pnpm run typecheck
```

Run the live integration pipeline checks against a configured local API:

```bash
cd server
TEST_BASE_URL=http://localhost:5000 pnpm run test:pipeline
```

The pipeline test covers first generation, exact and punctuation-normalized cache hits, distinct phrases, concurrent deduplication, and invalid input handling. Cache-miss cases require valid Gemini credentials, Supabase credentials, the database migrations, and the `isl-videos` bucket.

## Security and errors

- `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-only variables and must never be placed in Expo environment variables.
- API failures use structured `{ success: false, error: { code, message } }` responses.
- The mobile root error boundary provides a `Restart App` action, while `StatusToast` provides accessible non-technical feedback for network, validation, generation, and video failures.

## Project location

The Expo app is in `artifacts/isl-translator`.

- `app/` contains the Expo Router screens.
- `components/` contains reusable UI components.
- `constants/` contains colors and app constants.
- `assets/` contains images and other app assets.
- `package.json` contains the local Expo commands.

The original Replit-oriented command is still available as `dev`, but local development should use `dev:local`.
