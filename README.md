# ISL Translator

A mobile app for translating English or Tamil text into Indian Sign Language.

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

## Project location

The Expo app is in `artifacts/isl-translator`.

- `app/` contains the Expo Router screens.
- `components/` contains reusable UI components.
- `constants/` contains colors and app constants.
- `assets/` contains images and other app assets.
- `package.json` contains the local Expo commands.

The original Replit-oriented command is still available as `dev`, but local development should use `dev:local`.
