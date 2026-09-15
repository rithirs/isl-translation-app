# ISL Translator — Frontend

This project is the Vite + React frontend for the ISL Translator app.

It currently includes:
- a dark/light theme toggle
- a history button with quick greeting shortcuts
- English + Tamil phrase matching for local demo greeting videos
- a local video output viewer using files inside the public folder
- a responsive interface for the prototype build

## 1. Requirements

Make sure you have Node.js installed.

Check:

```bash
node -v
npm -v
```

If needed, install a recent LTS version of Node.js.

## 2. Open the project

From the project root, open the frontend folder in VS Code:

```bash
cd frontend
```

Then open a terminal inside that folder.

## 3. Install dependencies

Run:

```bash
npm install
```

## 4. Run the web app

Start the local dev server:

```bash
npm run dev
```

Then open the local URL printed in the terminal, usually:

```text
http://localhost:5173
```

## 5. Project structure

```text
frontend/
  public/
    videos/
      Hello.mp4
      Good_Morning.mp4
      How_are_you.mp4
      Nice_to_meet_you.mp4
      Good_night.mp4
      Bye.mp4
  src/
    App.jsx
    index.css
    main.jsx
  index.html
  package.json
  vite.config.js
  README.md
```

## 6. Local demo behavior

This frontend is currently designed to work without an external API.

It matches common greetings such as:
- Hello / வணக்கம்
- Good morning / காலை வணக்கம்
- How are you? / நீங்கள் எப்படி இருக்கிறீர்கள்?
- Nice to meet you / சந்திப்பதில் மகிழ்ச்சி
- Good night / நல்ல இரவு
- Bye / விடை

and then plays the correct local MP4 file from the public folder.

## 7. Offline mode

This frontend works fully offline for the current demo version.

You do not need internet access, a database, or a backend service to run it locally because:
- the app is a local Vite + React project
- the greeting videos are stored in `frontend/public/videos`
- the phrase matching is handled in the frontend itself

So you can run:

```bash
cd frontend
npm install
npm run dev
```

and the app will work without connecting to any external API.

The only fetch request in the code is optional and is only used if you later connect a real backend.

## 8. If you want to connect a real backend later

The app still has a fetch call in `src/App.jsx` to:

```text
http://localhost:8000/translate
```

You can override it with a `.env` file:

```env
VITE_TRANSLATE_API_URL=http://localhost:8000/translate
```

Then restart the app:

```bash
npm run dev
```

## 9. Build for production

To create a production build:

```bash
npm run build
```

To preview it locally:

```bash
npm run preview
```

## 10. Useful notes

- Keep all video files inside `frontend/public/videos` so Vite serves them correctly.
- If you add more MP4 files, update the phrase-to-video mapping in `src/App.jsx`.
- The project is currently a frontend prototype and not yet connected to a real database or AI translation backend.

## 11. Quick start summary

```bash
cd frontend
npm install
npm run dev
```

Then visit:

```text
http://localhost:5173
```
