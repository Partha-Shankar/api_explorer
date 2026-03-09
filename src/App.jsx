import { useState } from "react";

const APIs = [
  {
    id: "trivia",
    label: "Trivia Question",
    icon: "🧠",
    color: "#FF6B35",
    fetch: async () => {
      const res = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");
      const data = await res.json();
      const q = data.results[0];
      return {
        title: decodeURIComponent(q.category),
        body: decodeURIComponent(q.question),
        sub: `Difficulty: ${q.difficulty} • Answer: ${decodeURIComponent(q.correct_answer)}`,
      };
    },
  },
  {
    id: "dog",
    label: "Random Dog",
    icon: "🐶",
    color: "#4ECDC4",
    fetch: async () => {
      const res = await fetch("https://dog.ceo/api/breeds/image/random");
      const data = await res.json();
      const breed = data.message.split("/breeds/")[1].split("/")[0].replace("-", " ");
      return {
        title: breed.charAt(0).toUpperCase() + breed.slice(1),
        image: data.message,
        sub: "via Dog CEO API",
      };
    },
  },
  {
    id: "advice",
    label: "Life Advice",
    icon: "✨",
    color: "#A855F7",
    fetch: async () => {
      const res = await fetch("https://api.adviceslip.com/advice");
      const data = await res.json();
      return {
        title: `Advice #${data.slip.id}`,
        body: `"${data.slip.advice}"`,
        sub: "via Advice Slip API",
      };
    },
  },
  {
    id: "joke",
    label: "Random Joke",
    icon: "😂",
    color: "#F59E0B",
    fetch: async () => {
      const res = await fetch("https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist");
      const data = await res.json();
      const body = data.type === "single" ? data.joke : `${data.setup}\n\n${data.delivery}`;
      return {
        title: data.category,
        body,
        sub: `Type: ${data.type}`,
      };
    },
  },
];

function Card({ api }) {
  const [state, setState] = useState({ status: "idle", data: null, error: null });

  const handleFetch = async () => {
    setState({ status: "loading", data: null, error: null });
    try {
      const data = await api.fetch();
      setState({ status: "done", data, error: null });
    } catch (e) {
      setState({ status: "error", data: null, error: "Failed to fetch. Try again." });
    }
  };

  const { status, data, error } = state;

  return (
    <div style={{
      background: "#111",
      border: `1px solid ${api.color}33`,
      borderRadius: 16,
      padding: 28,
      display: "flex",
      flexDirection: "column",
      gap: 20,
      position: "relative",
      overflow: "hidden",
      transition: "border-color 0.3s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = api.color + "88"}
      onMouseLeave={e => e.currentTarget.style.borderColor = api.color + "33"}
    >
      {/* Glow blob */}
      <div style={{
        position: "absolute", top: -40, right: -40,
        width: 120, height: 120, borderRadius: "50%",
        background: api.color + "22", filter: "blur(30px)", pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 28 }}>{api.icon}</span>
        <div>
          <div style={{ color: api.color, fontSize: 11, fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase" }}>API Explorer</div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, fontFamily: "'Georgia', serif" }}>{api.label}</div>
        </div>
      </div>

      <button
        onClick={handleFetch}
        disabled={status === "loading"}
        style={{
          background: status === "loading" ? "#222" : api.color,
          color: status === "loading" ? api.color : "#000",
          border: `1.5px solid ${api.color}`,
          borderRadius: 8,
          padding: "10px 20px",
          fontFamily: "monospace",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1,
          cursor: status === "loading" ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {status === "loading" ? (
          <>
            <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
            FETCHING...
          </>
        ) : "→ FETCH DATA"}
      </button>

      {error && (
        <div style={{ color: "#ff6b6b", fontFamily: "monospace", fontSize: 13 }}>{error}</div>
      )}

      {data && (
        <div style={{
          background: "#0a0a0a",
          borderRadius: 10,
          padding: 18,
          borderLeft: `3px solid ${api.color}`,
          animation: "fadeIn 0.4s ease",
        }}>
          {data.image ? (
            <>
              <div style={{ color: api.color, fontFamily: "monospace", fontSize: 11, marginBottom: 10, textTransform: "uppercase", letterSpacing: 2 }}>{data.title}</div>
              <img src={data.image} alt="dog" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }} />
              <div style={{ color: "#555", fontFamily: "monospace", fontSize: 11, marginTop: 8 }}>{data.sub}</div>
            </>
          ) : (
            <>
              <div style={{ color: api.color, fontFamily: "monospace", fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>{data.title}</div>
              <div style={{ color: "#e0e0e0", fontSize: 15, lineHeight: 1.6, fontFamily: "'Georgia', serif", whiteSpace: "pre-line" }}>{data.body}</div>
              <div style={{ color: "#444", fontFamily: "monospace", fontSize: 11, marginTop: 10 }}>{data.sub}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      padding: "48px 24px",
      fontFamily: "system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ color: "#333", fontFamily: "monospace", fontSize: 12, letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>
            ◈ Public API Explorer ◈
          </div>
          <h1 style={{
            color: "#fff",
            fontSize: "clamp(32px, 5vw, 56px)",
            fontFamily: "'Georgia', serif",
            fontWeight: 400,
            margin: 0,
            lineHeight: 1.1,
          }}>
            4 APIs.<br />
            <span style={{ color: "#555" }}>One Click Away.</span>
          </h1>
          <p style={{ color: "#444", fontFamily: "monospace", fontSize: 13, marginTop: 16 }}>
            Click any button to fetch live data from free public APIs
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: 24,
        }}>
          {APIs.map(api => <Card key={api.id} api={api} />)}
        </div>

        <div style={{ textAlign: "center", marginTop: 48, color: "#2a2a2a", fontFamily: "monospace", fontSize: 11, letterSpacing: 2 }}>
          TRIVIA DB · DOG CEO · ADVICE SLIP · JOKE API
        </div>
      </div>
    </div>
  );
}