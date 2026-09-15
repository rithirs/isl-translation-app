import { useState } from "react";

const GREETINGS = [
  "Hello",
  "Good morning",
  "Good afternoon",
  "Good evening",
  "How are you?",
  "What is your name?",
  "Nice to meet you",
  "Thank you",
];

const API_URL =
  import.meta.env.VITE_TRANSLATE_API_URL || "http://localhost:8000/translate";

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
  const [showGreetings, setShowGreetings] = useState(true);
  const [creative, setCreative] = useState(false);
  const [autoStyling, setAutoStyling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const chooseGreeting = (greeting) => {
    setText(greeting);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!text.trim()) {
      setError("Please enter a sentence to translate.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

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

      // Expected backend response:
      // { "translation": "..." }
      setResult(data.translation || data.result || "Translation received.");
    } catch (requestError) {
      // Temporary demo state so Member 1 can test the UI before Member 2's
      // backend is connected.
      setResult(
        `Demo output for: "${text.trim()}"`
      );
      setError(
        "Backend is not connected yet. The UI is working; connect Member 2's API using VITE_TRANSLATE_API_URL."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 text-neutral-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Navbar */}
        <nav className="flex items-center justify-between border-b border-white/10 px-1 pb-5">
          <div className="text-base font-bold tracking-tight sm:text-lg">
            ISL TRANSLATOR
          </div>

          <button
            type="button"
            className="rounded-full p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
            title="Translation history"
            aria-label="Translation history"
          >
            <HistoryIcon />
          </button>
        </nav>

        {/* Hero */}
        <section className="mx-auto mt-16 max-w-4xl text-center sm:mt-20">
          <h1 className="text-3xl font-medium tracking-tight text-neutral-100 sm:text-4xl">
            What would you like to{" "}
            <span className="italic text-neutral-300">translate today?</span>
          </h1>
          <p className="mt-3 text-sm text-neutral-500">
            Enter English text and translate it into Indian Sign Language.
          </p>
        </section>

        {/* Main workspace */}
        <section className="relative mx-auto mt-10 max-w-4xl">
          {/* Greeting dropdown/card */}
          {showGreetings && (
            <aside className="absolute right-0 top-full z-20 mt-3 w-64 rounded-2xl border border-white/10 bg-[#292a2d] p-2 shadow-2xl shadow-black/30 sm:right-2">
              <div className="px-3 pb-2 pt-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
                Quick greetings
              </div>

              <div className="max-h-64 overflow-y-auto">
                {GREETINGS.map((greeting) => (
                  <button
                    key={greeting}
                    type="button"
                    onClick={() => chooseGreeting(greeting)}
                    className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-neutral-300 transition hover:bg-white/10 hover:text-white"
                  >
                    {greeting}
                  </button>
                ))}
              </div>
            </aside>
          )}

          {/* Input box */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-[#27282b] p-3 shadow-2xl shadow-black/10"
          >
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              onFocus={() => setShowGreetings(true)}
              placeholder="Write something to translate..."
              aria-label="English text to translate"
              className="min-h-40 w-full bg-transparent px-3 py-3 text-base leading-7 text-neutral-100 outline-none placeholder:text-neutral-600"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-2 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  title="Add content"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-neutral-300 transition hover:bg-white/10"
                >
                  +
                </button>

                <button
                  type="button"
                  onClick={() => setCreative((value) => !value)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    creative
                      ? "border-white/25 bg-white/15 text-white"
                      : "border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
                  }`}
                >
                  Creative
                </button>

                <button
                  type="button"
                  onClick={() => setAutoStyling((value) => !value)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    autoStyling
                      ? "border-white/25 bg-white/15 text-white"
                      : "border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
                  }`}
                >
                  Auto styling
                </button>

                <button
                  type="button"
                  onClick={() => setShowGreetings((value) => !value)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-400 transition hover:bg-white/10 hover:text-white"
                >
                  Greetings
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
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
            <p className="mt-3 rounded-xl border border-amber-300/10 bg-amber-300/5 px-4 py-3 text-xs leading-5 text-amber-200/80">
              {error}
            </p>
          )}

          {/* Output viewer */}
          <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#18191b]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-sm font-medium text-neutral-200">
                  ISL Output
                </h2>
                <p className="mt-1 text-xs text-neutral-600">
                  3D/video output will appear here
                </p>
              </div>

              <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-neutral-500">
                Viewer
              </span>
            </div>

            <div className="flex min-h-72 items-center justify-center p-6">
              {result ? (
                <div className="max-w-xl text-center">
                  <p className="text-xs uppercase tracking-widest text-neutral-600">
                    Translation result
                  </p>
                  <p className="mt-3 text-lg leading-8 text-neutral-200">
                    {result}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-500">
                    ▶
                  </div>
                  <p className="text-sm text-neutral-500">
                    Your ISL result will appear here.
                  </p>
                </div>
              )}
            </div>
          </section>
        </section>

        <footer className="mx-auto mt-8 max-w-4xl text-center text-xs text-neutral-600">
          Frontend prototype • React + Vite + Tailwind CSS
        </footer>
      </div>
    </main>
  );
}

export default App;