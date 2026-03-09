import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const APIs = [
  {
    id: "trivia",
    label: "Knowledge Base",
    tag: "TRIVIA",
    color: "#2563eb",
    fetch: async () => {
      const res = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");
      const data = await res.json();
      const q = data.results[0];
      return {
        title: decodeURIComponent(q.category),
        body: decodeURIComponent(q.question),
        sub: `Level: ${q.difficulty} • Correct: ${decodeURIComponent(q.correct_answer)}`,
      };
    },
  },
  {
    id: "dog",
    label: "Visual Asset",
    tag: "CURATED IMAGES",
    color: "#059669",
    fetch: async () => {
      const res = await fetch("https://dog.ceo/api/breeds/image/random");
      const data = await res.json();
      const breed = data.message.split("/breeds/")[1].split("/")[0].replace("-", " ");
      return {
        title: breed.charAt(0).toUpperCase() + breed.slice(1),
        image: data.message,
        sub: "Sourced via Dog CEO API",
      };
    },
  },
  {
    id: "advice",
    label: "Professional Guidance",
    tag: "ADVICE",
    color: "#7c3aed",
    fetch: async () => {
      const res = await fetch("https://api.adviceslip.com/advice");
      const data = await res.json();
      return {
        title: `Protocol #${data.slip.id}`,
        body: data.slip.advice,
        sub: "Intelligence provided by Advice Slip",
      };
    },
  },
  {
    id: "joke",
    label: "Human Element",
    tag: "ENTERTAINMENT",
    color: "#d97706",
    fetch: async () => {
      const res = await fetch("https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist");
      const data = await res.json();
      const body = data.type === "single" ? data.joke : `${data.setup}\n\n${data.delivery}`;
      return {
        title: data.category,
        body,
        sub: `Standard Classification: ${data.type}`,
      };
    },
  },
];

const Card = ({ api, index }) => {
  const [state, setState] = useState({ status: "idle", data: null, error: null });

  const handleFetch = async () => {
    setState({ status: "loading", data: null, error: null });
    try {
      const data = await api.fetch();
      setState({ status: "done", data, error: null });
    } catch (e) {
      setState({ status: "error", data: null, error: "Network communication error." });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "20px",
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.03)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{ 
            color: api.color, 
            fontSize: "11px", 
            fontWeight: "700", 
            letterSpacing: "1.5px", 
            textTransform: "uppercase" 
          }}>
            {api.tag}
          </span>
          <h2 style={{ 
            color: "#1e293b", 
            fontSize: "22px", 
            fontWeight: "600", 
            margin: "4px 0 0 0",
            fontFamily: "Inter, system-ui, sans-serif" 
          }}>
            {api.label}
          </h2>
        </div>
        <div style={{ 
          width: "8px", 
          height: "8px", 
          borderRadius: "50%", 
          background: api.color,
          boxShadow: `0 0 12px ${api.color}` 
        }} />
      </div>

      <button
        onClick={handleFetch}
        disabled={state.status === "loading"}
        style={{
          background: "#1e293b",
          color: "#ffffff",
          border: "none",
          borderRadius: "12px",
          padding: "14px 24px",
          fontSize: "14px",
          fontWeight: "500",
          cursor: state.status === "loading" ? "not-allowed" : "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          outline: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#334155")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#1e293b")}
      >
        {state.status === "loading" ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            style={{ width: "16px", height: "16px", border: "2px solid #ffffff", borderTopColor: "transparent", borderRadius: "50%" }}
          />
        ) : (
          "Request Data"
        )}
      </button>

      <AnimatePresence mode="wait">
        {state.data && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              background: "#f8fafc",
              borderRadius: "14px",
              padding: "20px",
              border: "1px solid #f1f5f9",
            }}>
              {state.data.image ? (
                <>
                  <img src={state.data.image} alt="content" style={{ width: "100%", borderRadius: "8px", marginBottom: "12px", display: "block" }} />
                  <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>{state.data.sub}</p>
                </>
              ) : (
                <>
                  <div style={{ color: api.color, fontSize: "11px", fontWeight: "700", marginBottom: "8px" }}>{state.data.title}</div>
                  <div style={{ color: "#334155", fontSize: "15px", lineHeight: "1.6", fontWeight: "400" }}>{state.data.body}</div>
                  <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>{state.data.sub}</div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {state.error && (
        <div style={{ color: "#ef4444", fontSize: "13px", textAlign: "center" }}>{state.error}</div>
      )}
    </motion.div>
  );
};

export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#fcfcfd",
      padding: "80px 24px",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: "#1e293b",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: "80px" }}
        >
          <span style={{ 
            background: "#f1f5f9", 
            padding: "8px 16px", 
            borderRadius: "100px", 
            fontSize: "12px", 
            fontWeight: "600", 
            letterSpacing: "1px",
            color: "#64748b"
          }}>
            V1.0 DATA INTERFACE
          </span>
          <h1 style={{ 
            fontSize: "clamp(40px, 6vw, 64px)", 
            fontWeight: "800", 
            letterSpacing: "-0.04em", 
            margin: "24px 0 16px 0",
            lineHeight: 1 
          }}>
            Universal API <span style={{ color: "#94a3b8" }}>Aggregator.</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "18px", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
            A professional ecosystem designed to interact with diverse public data endpoints through a unified, high-performance interface.
          </p>
        </motion.header>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "32px",
        }}>
          {APIs.map((api, idx) => (
            <Card key={api.id} api={api} index={idx} />
          ))}
        </div>

        <footer style={{ 
          marginTop: "100px", 
          textAlign: "center", 
          borderTop: "1px solid #e2e8f0", 
          paddingTop: "40px",
          color: "#94a3b8",
          fontSize: "13px",
          letterSpacing: "1px"
        }}>
          SYSTEM STATUS: OPERATIONAL · ENCRYPTION: ACTIVE · DATA SOURCE: PUBLIC CLOUD
        </footer>
      </div>
    </div>
  );
}