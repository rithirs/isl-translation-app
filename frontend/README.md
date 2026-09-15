# ISL Translator — Frontend

This is the frontend portion of the ISL Translator group project.

## 1. Requirements

Install Node.js first. Current Vite documentation requires a modern Node.js version; if npm gives a version warning, update Node.js.

## 2. Open in VS Code

1. Extract this ZIP.
2. Open the extracted `isl-translator-frontend` folder in VS Code.
3. Open **Terminal → New Terminal**.

## 3. Install dependencies

Run:

```bash
npm install
```

## 4. Start the website

Run:

```bash
npm run dev
```

Open the local URL shown by Vite, usually:

```text
http://localhost:5173
```

## 5. What is already implemented?

- Navbar with **ISL TRANSLATOR**
- History icon
- Centered hero text
- Rounded main text input
- `+` button
- Creative toggle
- Auto styling toggle
- Greetings floating card
- Clicking a greeting fills the input automatically
- Submit/arrow button
- Loading state
- Output viewer placeholder for the future 3D/video result
- Responsive layout for laptop and mobile screens
- Tailwind CSS v4 using the Vite plugin

## 6. Connecting Member 2's backend

The frontend sends a POST request to:

```text
http://localhost:8000/translate
```

with JSON like:

```json
{
  "text": "Hello",
  "creative": false,
  "autoStyling": false
}
```

The frontend currently expects a JSON response containing either:

```json
{
  "translation": "..."
}
```

or:

```json
{
  "result": "..."
}
```

### If Member 2 uses another URL

Create a `.env` file in the project root:

```text
VITE_TRANSLATE_API_URL=http://localhost:YOUR_PORT/YOUR_ENDPOINT
```

Then restart `npm run dev`.

### If Member 2's API has a different request/response format

Only edit the `handleSubmit()` function in:

```text
src/App.jsx
```

The UI does not need to be rewritten.

## 7. Files you should send to your friend

Send the complete ZIP/project folder. The important files are:

```text
src/
  App.jsx
  index.css
  main.jsx
index.html
package.json
vite.config.js
README.md
```

Do NOT send `node_modules` because your friend can recreate it with:

```bash
npm install
```

## 8. Team handoff message

You can send this to your friend:

> I completed the frontend for the ISL Translator. Extract the ZIP, open the folder in VS Code, run `npm install`, then `npm run dev`. The UI is ready and the `handleSubmit()` function in `src/App.jsx` is prepared for the backend. The frontend currently sends POST `/translate` with the text and UI options. Please tell me your exact backend endpoint and request/response format if it is different, and I can adjust the integration.

## Important

The output viewer is intentionally a placeholder. Your teammate can later replace the inside of the **ISL Output** section with the actual 3D/video/canvas component without changing the rest of the interface.
