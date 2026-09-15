import { useEffect, useState } from "react";

const GREETINGS = [
  "Hello",
  "Good morning",
  "How are you?",
  "Nice to meet you",
  "Good night",
  "Bye",
];

const API_URL =
  import.meta.env.VITE_TRANSLATE_API_URL || "http://localhost:8000/translate";

const HERO_MESSAGES = [
  {
    headline: "What would you like to translate today?",
    subheading: "Enter English text and translate it into Indian Sign Language.",
  },
  {
    headline: "இன்று நீங்கள் எதை மொழிபெயர்க்க விரும்புகிறீர்கள்?",
    subheading: "ஆங்கில வார்த்தைகளை உள்ளிட்டு, இந்திய சைகை மொழியில் மொழிபெயர்க்கவும்.",
  },
];

const VIDEO_LIBRARY = {
  hello: "/videos/Hello.mp4",
  "good morning": "/videos/Good_Morning.mp4",
  "how are you?": "/videos/How_are_you.mp4",
  "nice to meet you": "/videos/Nice_to_meet_you.mp4",
  "good night": "/videos/Good_night.mp4",
  bye: "/videos/Bye.mp4",
  "good bye": "/videos/Bye.mp4",
  goodbye: "/videos/Bye.mp4",
};

const PHRASE_MAP = {
  hello: "hello",
  "good morning": "good morning",
  "how are you": "how are you?",
  "how are you?": "how are you?",
  "nice to meet you": "nice to meet you",
  "good night": "good night",
  bye: "bye",
  "good bye": "bye",
  goodbye: "bye",
  வணக்கம்: "hello",
  "வணக்கம் நண்பா": "hello",
  "காலை வணக்கம்": "good morning",
  "சுப காலை": "good morning",
  "நீங்கள் எப்படி இருக்கிறீர்கள்": "how are you?",
  "நீங்கள் எப்படி இருக்கிறீர்கள்?": "how are you?",
  "எப்படி இருக்கிறீர்கள்": "how are you?",
  "சந்திப்பதில் மகிழ்ச்சி": "nice to meet you",
  "சந்திப்பதில் மகிழ்ச்சி அடை": "nice to meet you",
  "சந்தித்து மகிழ்ச்சி": "nice to meet you",
  "நல்ல இரவு": "good night",
  "நன்றாக உறங்குங்கள்": "good night",
  "இரவு விடிவதற்கு": "good night",
  "விடை": "bye",
  "பிரியா விடை": "bye",
  "செல்கிறேன்": "bye",
};

function normalizeInputText(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ");
}

function resolvePhrase(value) {
  const normalized = normalizeInputText(value);
  return PHRASE_MAP[normalized] || null;
}

function HistoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 12h13" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function App() {
  const [text, setText] = useState("");
  const [showGreetings, setShowGreetings] = useState(false);
  const [creative, setCreative] = useState(false);
  const [autoStyling, setAutoStyling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setHeroIndex((current) => (current + 1) % HERO_MESSAGES.length);
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  const heroMessage = HERO_MESSAGES[heroIndex];

  const chooseGreeting = (greeting) => {
    const normalized = greeting.trim().toLowerCase();
    const resolved = resolvePhrase(greeting) || normalized;
    setText(greeting);
    setError("");
    setVideoUrl(VIDEO_LIBRARY[resolved] || VIDEO_LIBRARY["good morning"]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!text.trim()) {
      setError("Please enter a sentence to translate.");
      return;
    }

    const resolvedEnglishText = resolvePhrase(text) || normalizeInputText(text);
    const matchedVideo = VIDEO_LIBRARY[resolvedEnglishText] || VIDEO_LIBRARY["good morning"];

    setLoading(true);
    setError("");
    setResult("");
    setVideoUrl(matchedVideo);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          creative,
          autoStyling,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = await response.json();
      setResult(data.translation || data.result || resolvedEnglishText);
    } catch (requestError) {
      setResult(
        resolvedEnglishText
          ? `Matched to: "${resolvedEnglishText}"`
          : `Demo output for: "${text.trim()}"`
      );
      setError(
        "Backend is not connected yet. Using the local greeting video demo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`min-h-screen px-4 py-6 transition-colors duration-200 sm:px-8 ${
        isDarkMode ? "bg-[#111315] text-neutral-100" : "bg-[#f5f5f4] text-neutral-900"
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <nav
          className={`flex items-center justify-between border-b px-1 pb-5 ${
            isDarkMode ? "border-white/10" : "border-neutral-300"
          }`}
        >
          <div className="text-base font-bold tracking-tight sm:text-lg">
            ISL TRANSLATOR
          </div>

          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDarkMode((value) => !value)}
              className={`rounded-full p-2 text-sm font-medium transition ${
                isDarkMode
                  ? "bg-white/5 text-neutral-200 hover:bg-white/10 hover:text-white"
                  : "bg-neutral-200 text-neutral-800 hover:bg-neutral-300"
              }`}
              title="Toggle light/dark mode"
              aria-label="Toggle light/dark mode"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowGreetings((value) => !value)}
                className={`rounded-full p-2 transition ${
                  isDarkMode
                    ? "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                    : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 hover:text-neutral-900"
                }`}
                title="Translation history"
                aria-label="Translation history"
              >
                <HistoryIcon />
              </button>

              {showGreetings && (
                <aside
                  className={`absolute right-0 top-full z-20 mt-3 w-64 rounded-2xl border p-2 shadow-2xl ${
                    isDarkMode
                      ? "border-white/10 bg-[#292a2d] shadow-black/30"
                      : "border-neutral-200 bg-white shadow-neutral-300/60"
                  }`}
                >
                  <div
                    className={`px-3 pb-2 pt-2 text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-neutral-500" : "text-neutral-500"
                    }`}
                  >
                    Quick greetings
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {GREETINGS.map((greeting) => (
                      <button
                        key={greeting}
                        type="button"
                        onClick={() => {
                          chooseGreeting(greeting);
                          setShowGreetings(false);
                        }}
                        className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                          isDarkMode
                            ? "text-neutral-300 hover:bg-white/10 hover:text-white"
                            : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                        }`}
                      >
                        {greeting}
                      </button>
                    ))}
                  </div>
                </aside>
              )}
            </div>
          </div>
        </nav>

        <section className="mx-auto mt-16 max-w-4xl text-center sm:mt-20">
          <h1
            key={heroMessage.headline}
            className={`hero-fade text-3xl font-medium tracking-tight sm:text-4xl ${
              isDarkMode ? "text-neutral-100" : "text-neutral-800"
            }`}
          >
            {heroMessage.headline}
          </h1>
          <p
            key={heroMessage.subheading}
            className={`hero-fade mt-3 text-sm ${
              isDarkMode ? "text-neutral-500" : "text-neutral-600"
            }`}
          >
            {heroMessage.subheading}
          </p>
        </section>

        <section className="relative mx-auto mt-10 max-w-4xl">
          <form
            onSubmit={handleSubmit}
            className={`rounded-3xl border p-3 shadow-2xl ${
              isDarkMode
                ? "border-white/10 bg-[#27282b] shadow-black/10"
                : "border-neutral-200 bg-white shadow-neutral-200"
            }`}
          >
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              onFocus={() => setShowGreetings(true)}
              placeholder="Type in English or Tamil..."
              aria-label="English or Tamil text to translate"
              className={`min-h-40 w-full bg-transparent px-3 py-3 text-base leading-7 outline-none ${
                isDarkMode
                  ? "text-neutral-100 placeholder:text-neutral-600"
                  : "text-neutral-900 placeholder:text-neutral-500"
              }`}
            />

            <div
              className={`flex flex-wrap items-center justify-between gap-3 border-t px-2 pt-3 ${
                isDarkMode ? "border-white/10" : "border-neutral-200"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  title="Add content"
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-lg transition ${
                    isDarkMode
                      ? "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10"
                      : "border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  +
                </button>

                <button
                  type="button"
                  onClick={() => setCreative((value) => !value)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    creative
                      ? isDarkMode
                        ? "border-white/25 bg-white/15 text-white"
                        : "border-neutral-400 bg-neutral-200 text-neutral-900"
                      : isDarkMode
                        ? "border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
                        : "border-neutral-300 bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  Creative
                </button>

                <button
                  type="button"
                  onClick={() => setAutoStyling((value) => !value)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    autoStyling
                      ? isDarkMode
                        ? "border-white/25 bg-white/15 text-white"
                        : "border-neutral-400 bg-neutral-200 text-neutral-900"
                      : isDarkMode
                        ? "border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
                        : "border-neutral-300 bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  Auto styling
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isDarkMode
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "bg-neutral-900 text-white hover:bg-neutral-700"
                }`}
                title="Translate"
                aria-label="Translate"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                ) : (
                  <ArrowIcon />
                )}
              </button>
            </div>
          </form>

          {error && (
            <p className={`mt-3 rounded-xl border px-4 py-3 text-xs leading-5 ${
              isDarkMode
                ? "border-amber-300/10 bg-amber-300/5 text-amber-200/80"
                : "border-amber-400/20 bg-amber-100 text-amber-800"
            }`}>
              {error}
            </p>
          )}

          <section
            className={`mt-8 overflow-hidden rounded-3xl border ${
              isDarkMode ? "border-white/10 bg-[#18191b]" : "border-neutral-200 bg-white"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b px-5 py-4 ${
                isDarkMode ? "border-white/10" : "border-neutral-200"
              }`}
            >
              <div>
                <h2 className={`text-sm font-medium ${isDarkMode ? "text-neutral-200" : "text-neutral-800"}`}>
                  ISL Output
                </h2>
                <p className={`mt-1 text-xs ${isDarkMode ? "text-neutral-600" : "text-neutral-500"}`}>
                  3D/video output will appear here
                </p>
              </div>

              <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider ${
                isDarkMode ? "bg-white/5 text-neutral-500" : "bg-neutral-100 text-neutral-600"
              }`}>
                Viewer
              </span>
            </div>

            <div className="flex min-h-72 items-center justify-center p-6">
              {videoUrl ? (
                <div className={`w-full max-w-xl overflow-hidden rounded-2xl border ${
                  isDarkMode ? "border-white/10 bg-black/30" : "border-neutral-200 bg-neutral-100"
                }`}>
                  <video
                    key={videoUrl}
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="h-72 w-full object-cover"
                  />
                  {result && (
                    <div className={`border-t px-4 py-3 text-center ${
                      isDarkMode ? "border-white/10 bg-[#121416]" : "border-neutral-200 bg-neutral-50"
                    }`}>
                      <p className={`text-xs uppercase tracking-widest ${
                        isDarkMode ? "text-neutral-600" : "text-neutral-500"
                      }`}>
                        Translation result
                      </p>
                      <p className={`mt-2 text-lg leading-7 ${
                        isDarkMode ? "text-neutral-200" : "text-neutral-800"
                      }`}>
                        {result}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${
                    isDarkMode
                      ? "border-white/10 bg-white/5 text-neutral-500"
                      : "border-neutral-200 bg-neutral-100 text-neutral-500"
                  }`}>
                    ▶
                  </div>
                  <p className={isDarkMode ? "text-sm text-neutral-500" : "text-sm text-neutral-600"}>
                    Your ISL result will appear here.
                  </p>
                </div>
              )}
            </div>
          </section>
        </section>

        <footer className={`mx-auto mt-8 max-w-4xl text-center text-xs ${
          isDarkMode ? "text-neutral-600" : "text-neutral-500"
        }`}>
          Frontend prototype • React + Vite + Tailwind CSS
        </footer>
      </div>
    </main>
  );
}

export default App;
