import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────── DATA ─────────────── */
const APIS = [
  {
    id: "trivia",
    label: "TRIVIA",
    sublabel: "Test Your Knowledge",
    index: "01",
    hue: "#FF3CAC",
    glow: "rgba(255,60,172,0.35)",
    dim: "rgba(255,60,172,0.08)",
    icon: "◈",
    fetch: async () => {
      const res = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");
      const data = await res.json();
      const q = data.results[0];
      return {
        title: decodeURIComponent(q.category),
        body: decodeURIComponent(q.question),
        meta: `Difficulty · ${q.difficulty.toUpperCase()}`,
        answer: decodeURIComponent(q.correct_answer),
      };
    },
  },
  {
    id: "dog",
    label: "DOGS",
    sublabel: "Random Breed Photo",
    index: "02",
    hue: "#00F5D4",
    glow: "rgba(0,245,212,0.30)",
    dim: "rgba(0,245,212,0.07)",
    icon: "◉",
    fetch: async () => {
      const res = await fetch("https://dog.ceo/api/breeds/image/random");
      const data = await res.json();
      const breed = data.message.split("/breeds/")[1].split("/")[0].replace(/-/g, " ");
      return {
        title: breed.replace(/\b\w/g, c => c.toUpperCase()),
        image: data.message,
        meta: "Dog CEO API",
      };
    },
  },
  {
    id: "wisdom",
    label: "WISDOM",
    sublabel: "Life Advice",
    index: "03",
    hue: "#FFBE0B",
    glow: "rgba(255,190,11,0.30)",
    dim: "rgba(255,190,11,0.07)",
    icon: "◇",
    fetch: async () => {
      const res = await fetch("https://api.adviceslip.com/advice");
      const data = await res.json();
      return {
        title: `SLIP #${data.slip.id}`,
        body: data.slip.advice,
        meta: "Advice Slip API",
      };
    },
  },
  {
    id: "humor",
    label: "HUMOR",
    sublabel: "Random Joke",
    index: "04",
    hue: "#8B5CF6",
    glow: "rgba(139,92,246,0.35)",
    dim: "rgba(139,92,246,0.08)",
    icon: "◎",
    fetch: async () => {
      const res = await fetch("https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist");
      const data = await res.json();
      const body = data.type === "single" ? data.joke : `${data.setup}\n\n${data.delivery}`;
      return { title: data.category.toUpperCase(), body, meta: `${data.type.toUpperCase()} · JOKEAPI` };
    },
  },
];

/* ─────────────── HOOKS ─────────────── */
function useInView(delay = 0) {
  const [show, setShow] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setShow(true), delay); obs.disconnect(); }
    }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return [ref, show];
}

function useCounter(target, active) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let cur = 0;
    const step = target / 50;
    const id = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(cur));
    }, 25);
    return () => clearInterval(id);
  }, [active, target]);
  return val;
}

/* ─────────────── NOISE SVG (inline) ─────────────── */
const NoiseSVG = () => (
  <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", opacity: 0.035, pointerEvents: "none", zIndex: 1 }}>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)"/>
  </svg>
);

/* ─────────────── CURSOR GLOW ─────────────── */
function CursorGlow() {
  const ref = useRef();
  useEffect(() => {
    const move = (e) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <div ref={ref} style={{
      position: "fixed", top: 0, left: 0, width: 400, height: 400,
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
      pointerEvents: "none", zIndex: 0, transition: "transform 0.15s ease-out",
    }} />
  );
}

/* ─────────────── FETCH BUTTON ─────────────── */
function FetchButton({ api, loading, onClick }) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => { setPress(false); if (!loading) onClick(); }}
      disabled={loading}
      style={{
        position: "relative", overflow: "hidden",
        padding: "14px 36px", borderRadius: 4,
        border: `1px solid ${hover && !loading ? api.hue : "rgba(255,255,255,0.12)"}`,
        background: hover && !loading ? api.dim : "transparent",
        color: hover && !loading ? api.hue : "rgba(255,255,255,0.55)",
        fontSize: 11, fontWeight: 700, letterSpacing: 3,
        textTransform: "uppercase", fontFamily: "'Space Mono', monospace",
        cursor: loading ? "not-allowed" : "pointer",
        transform: press ? "scale(0.97)" : "scale(1)",
        transition: "all 0.2s ease",
        display: "flex", alignItems: "center", gap: 10,
        boxShadow: hover && !loading ? `0 0 20px ${api.glow}` : "none",
      }}
    >
      {loading ? (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: "spin 0.8s linear infinite" }}>
            <circle cx="7" cy="7" r="5" fill="none" stroke={api.hue} strokeWidth="1.5" strokeDasharray="18" strokeLinecap="round"/>
          </svg>
          FETCHING
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          FETCH DATA
        </>
      )}
    </button>
  );
}

/* ─────────────── CARD ─────────────── */
function APICard({ api, index }) {
  const [status, setStatus] = useState("idle");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [ref, show] = useInView(index * 120);
  const [hover, setHover] = useState(false);

  const doFetch = useCallback(async () => {
    setStatus("loading"); setData(null); setError(null);
    try {
      const d = await api.fetch();
      setData(d); setStatus("done");
    } catch {
      setError("Connection failed. Retry."); setStatus("error");
    }
  }, [api]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        background: "rgba(12,12,18,0.95)",
        border: `1px solid ${hover ? api.hue + "55" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 2,
        padding: "40px 44px 44px",
        display: "flex", flexDirection: "column", gap: 0,
        overflow: "hidden", minHeight: 460,
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.7s ease ${index * 0.1}s, transform 0.7s ease ${index * 0.1}s, border-color 0.3s ease, box-shadow 0.3s ease`,
        boxShadow: hover ? `0 0 60px ${api.glow}, inset 0 0 60px rgba(0,0,0,0.3)` : "0 4px 40px rgba(0,0,0,0.4)",
      }}
    >
      {/* Top edge accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${api.hue}, transparent)`,
        opacity: hover ? 1 : 0.4,
        transition: "opacity 0.3s ease",
      }} />

      {/* Large index watermark */}
      <div style={{
        position: "absolute", bottom: -20, right: 24,
        fontSize: 160, fontWeight: 900, lineHeight: 1,
        color: "rgba(255,255,255,0.02)",
        fontFamily: "'Bebas Neue', sans-serif",
        pointerEvents: "none", userSelect: "none",
        transition: "color 0.3s ease",
        ...(hover && { color: api.dim }),
      }}>{api.index}</div>

      {/* Corner icon */}
      <div style={{
        position: "absolute", top: 28, right: 32,
        fontSize: 22, color: api.hue, opacity: 0.6,
        fontFamily: "monospace",
      }}>{api.icon}</div>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          marginBottom: 18,
        }}>
          <div style={{ width: 20, height: 1, background: api.hue, opacity: 0.8 }} />
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 4,
            textTransform: "uppercase", color: api.hue,
            fontFamily: "'Space Mono', monospace",
          }}>{api.sublabel}</span>
        </div>

        <h2 style={{
          margin: 0, fontSize: 56, fontWeight: 400, lineHeight: 0.95,
          fontFamily: "'Bebas Neue', sans-serif",
          color: "#fff",
          letterSpacing: 4,
          textShadow: hover ? `0 0 30px ${api.glow}` : "none",
          transition: "text-shadow 0.3s ease",
        }}>{api.label}</h2>
      </div>

      {/* Separator */}
      <div style={{
        height: 1,
        background: `linear-gradient(90deg, ${api.hue}33, transparent)`,
        marginBottom: 32,
      }} />

      {/* Button */}
      <FetchButton api={api} loading={status === "loading"} onClick={doFetch} />

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 20, padding: "12px 16px", borderRadius: 2,
          border: "1px solid rgba(255,60,60,0.3)",
          background: "rgba(255,60,60,0.07)",
          color: "#FF6B6B", fontSize: 11,
          fontFamily: "'Space Mono', monospace", letterSpacing: 1,
        }}>{error}</div>
      )}

      {/* Result */}
      {data && (
        <div style={{
          marginTop: 28, flex: 1,
          animation: "fadeUp 0.5s cubic-bezier(.22,1,.36,1) both",
        }}>
          {data.image ? (
            <div style={{ position: "relative", borderRadius: 2, overflow: "hidden" }}>
              <img src={data.image} alt="dog"
                style={{ width: "100%", height: 220, objectFit: "cover", display: "block", filter: "brightness(0.85)" }} />
              <div style={{
                position: "absolute", inset: 0,
                background: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)`,
              }} />
              <div style={{ position: "absolute", bottom: 18, left: 20 }}>
                <div style={{
                  fontSize: 11, color: api.hue, fontFamily: "'Space Mono', monospace",
                  letterSpacing: 3, marginBottom: 4,
                }}>BREED IDENTIFIED</div>
                <div style={{ fontSize: 24, fontWeight: 400, color: "#fff", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3 }}>
                  {data.title}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              padding: "24px 26px",
              background: "rgba(255,255,255,0.025)",
              border: `1px solid ${api.hue}22`,
              borderLeft: `2px solid ${api.hue}`,
              borderRadius: 2,
            }}>
              <div style={{
                fontSize: 9, letterSpacing: 4, textTransform: "uppercase",
                color: api.hue, fontFamily: "'Space Mono', monospace",
                marginBottom: 14,
              }}>{data.title}</div>
              <p style={{
                margin: 0, fontSize: 15, lineHeight: 1.8,
                color: "rgba(255,255,255,0.78)",
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontStyle: "italic",
                whiteSpace: "pre-line",
              }}>{data.body}</p>
              {data.meta && (
                <div style={{
                  marginTop: 16, paddingTop: 14,
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  fontSize: 9, color: "rgba(255,255,255,0.25)",
                  fontFamily: "'Space Mono', monospace", letterSpacing: 2,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span>{data.meta}</span>
                  {data.answer && (
                    <span style={{
                      color: api.hue, fontWeight: 700,
                      padding: "4px 10px",
                      border: `1px solid ${api.hue}44`,
                      borderRadius: 2, letterSpacing: 1,
                    }}>✓ {data.answer}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────── STAT COUNTER ─────────────── */
function Stat({ num, suffix, label, delay, hue }) {
  const [ref, show] = useInView(delay);
  const val = useCounter(num, show);
  return (
    <div ref={ref} style={{
      textAlign: "center",
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      <div style={{
        fontSize: 52, fontWeight: 400, lineHeight: 1,
        fontFamily: "'Bebas Neue', sans-serif",
        color: hue, letterSpacing: 2,
        textShadow: `0 0 30px ${hue}66`,
      }}>{val}{suffix}</div>
      <div style={{
        fontSize: 9, color: "rgba(255,255,255,0.3)",
        fontFamily: "'Space Mono', monospace",
        letterSpacing: 4, textTransform: "uppercase", marginTop: 6,
      }}>{label}</div>
    </div>
  );
}

/* ─────────────── ANIMATED GRID LINES ─────────────── */
function GridLines() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{
          position: "absolute", top: 0, bottom: 0,
          left: `${(i + 1) * 12.5}%`, width: 1,
          background: "rgba(255,255,255,0.02)",
        }} />
      ))}
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{
          position: "absolute", left: 0, right: 0,
          top: `${(i + 1) * 12.5}%`, height: 1,
          background: "rgba(255,255,255,0.02)",
        }} />
      ))}
    </div>
  );
}

/* ─────────────── TICKER ─────────────── */
function Ticker() {
  const items = ["TRIVIA", "·", "DOGS", "·", "WISDOM", "·", "HUMOR", "·", "LIVE DATA", "·", "NO API KEY", "·", "FREE", "·"];
  const doubled = [...items, ...items];
  return (
    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "12px 0", overflow: "hidden",
      background: "rgba(255,255,255,0.015)",
    }}>
      <div style={{ display: "flex", gap: 40, animation: "ticker 20s linear infinite", width: "max-content" }}>
        {doubled.map((item, i) => (
          <span key={i} style={{
            fontSize: 9, fontFamily: "'Space Mono', monospace",
            letterSpacing: 4, color: "rgba(255,255,255,0.2)",
            whiteSpace: "nowrap",
          }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── HERO ─────────────── */
function Hero() {
  const [ref, show] = useInView(0);
  const [titleRef, titleShow] = useInView(100);
  return (
    <section style={{
      position: "relative", minHeight: "100vh",
      display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "0 72px", overflow: "hidden",
    }}>
      <GridLines />

      {/* Background gradient orbs */}
      <div style={{
        position: "absolute", top: "20%", right: "15%",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", left: "5%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,60,172,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Eyebrow */}
      <div ref={ref} style={{
        display: "flex", alignItems: "center", gap: 14, marginBottom: 44,
        opacity: show ? 1 : 0, transform: show ? "none" : "translateY(16px)",
        transition: "all 0.8s ease",
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          {APIS.map(a => (
            <div key={a.id} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: a.hue, boxShadow: `0 0 8px ${a.glow}`,
            }} />
          ))}
        </div>
        <span style={{
          fontSize: 9, letterSpacing: 5, textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace",
        }}>4 Free Public APIs · Zero Configuration</span>
      </div>

      {/* Main title */}
      <div ref={titleRef} style={{
        opacity: titleShow ? 1 : 0,
        transition: "opacity 1s ease 0.1s",
      }}>
        <h1 style={{
          margin: 0, fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(80px, 11vw, 160px)",
          fontWeight: 400, lineHeight: 0.9,
          letterSpacing: 6, color: "#fff",
        }}>
          <span style={{ display: "block", opacity: titleShow ? 1 : 0, transform: titleShow ? "none" : "translateY(30px)", transition: "all 0.8s cubic-bezier(.22,1,.36,1) 0.15s" }}>
            LIVE
          </span>
          <span style={{
            display: "block",
            background: "linear-gradient(135deg, #FF3CAC 0%, #784BA0 40%, #2B86C5 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            opacity: titleShow ? 1 : 0, transform: titleShow ? "none" : "translateY(30px)",
            transition: "all 0.8s cubic-bezier(.22,1,.36,1) 0.3s",
          }}>DATA</span>
          <span style={{ display: "block", opacity: titleShow ? 1 : 0, transform: titleShow ? "none" : "translateY(30px)", transition: "all 0.8s cubic-bezier(.22,1,.36,1) 0.45s" }}>
            EXPLORER
          </span>
        </h1>
      </div>

      {/* Bottom row */}
      <div style={{
        position: "absolute", bottom: 56, left: 72, right: 72,
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      }}>
        <p style={{
          margin: 0, maxWidth: 380,
          fontSize: 15, color: "rgba(255,255,255,0.38)",
          fontFamily: "'Crimson Pro', Georgia, serif",
          fontStyle: "italic", lineHeight: 1.8,
          opacity: titleShow ? 1 : 0, transform: titleShow ? "none" : "translateY(20px)",
          transition: "all 0.8s ease 0.6s",
        }}>
          Explore four curated free APIs — trivia questions, dog breed photos,
          life wisdom, and humor — fetched live with a single click.
        </p>

        <div style={{
          display: "flex", gap: 56,
          opacity: titleShow ? 1 : 0,
          transition: "opacity 0.8s ease 0.7s",
        }}>
          <Stat num={4} suffix="" label="APIs" delay={800} hue="#FF3CAC" />
          <Stat num={100} suffix="%" label="Free" delay={900} hue="#00F5D4" />
          <Stat num={0} suffix="" label="Keys Needed" delay={1000} hue="#FFBE0B" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: 56, left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        opacity: 0.3, animation: "bounce 2s ease infinite",
      }}>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <rect x="1" y="1" width="14" height="22" rx="7" stroke="white" strokeWidth="1"/>
          <rect x="7" y="5" width="2" height="6" rx="1" fill="white" style={{ animation: "scrollDot 2s ease infinite" }}/>
        </svg>
      </div>
    </section>
  );
}

/* ─────────────── NAV ─────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: 64, padding: "0 72px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(8,8,14,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      transition: "all 0.4s ease",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 6,
          background: "linear-gradient(135deg, #FF3CAC, #784BA0, #2B86C5)",
          display: "grid", placeItems: "center",
          boxShadow: "0 0 20px rgba(139,92,246,0.4)",
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white"/>
            <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.6"/>
            <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.6"/>
            <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.3"/>
          </svg>
        </div>
        <span style={{
          fontSize: 13, fontWeight: 400, color: "#fff",
          fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 4,
        }}>API EXPLORER</span>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 2 }}>
        {APIS.map(api => (
          <div key={api.id} style={{
            padding: "6px 16px", borderRadius: 2,
            fontSize: 9, fontFamily: "'Space Mono', monospace",
            letterSpacing: 3, color: api.hue,
            background: api.dim,
            border: `1px solid ${api.hue}22`,
          }}>{api.label}</div>
        ))}
      </div>

      {/* Status */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00F5D4", boxShadow: "0 0 8px #00F5D4", animation: "pulse 2s ease infinite" }} />
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace", letterSpacing: 3 }}>LIVE</span>
      </div>
    </nav>
  );
}

/* ─────────────── GRID SECTION ─────────────── */
function GridSection() {
  const [ref, show] = useInView(0);
  return (
    <section style={{ padding: "80px 72px 100px", position: "relative" }}>
      {/* Section header */}
      <div ref={ref} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 56,
        opacity: show ? 1 : 0, transform: show ? "none" : "translateY(20px)",
        transition: "all 0.7s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.15)" }} />
          <span style={{
            fontSize: 9, fontFamily: "'Space Mono', monospace",
            letterSpacing: 5, color: "rgba(255,255,255,0.25)",
            textTransform: "uppercase",
          }}>Interactive Endpoints</span>
        </div>
        <span style={{
          fontSize: 9, fontFamily: "'Space Mono', monospace",
          letterSpacing: 3, color: "rgba(255,255,255,0.15)",
        }}>04 MODULES</span>
      </div>

      {/* 2x2 grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
      }}>
        {APIS.map((api, i) => <APICard key={api.id} api={api} index={i} />)}
      </div>
    </section>
  );
}

/* ─────────────── FOOTER ─────────────── */
function Footer() {
  const [ref, show] = useInView(0);
  return (
    <footer style={{
      position: "relative",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      padding: "48px 72px",
    }}>
      <div ref={ref} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 24,
        opacity: show ? 1 : 0, transition: "opacity 0.8s ease",
      }}>
        {/* Left: Logo + copyright */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 5,
              background: "linear-gradient(135deg, #FF3CAC, #784BA0)",
              display: "grid", placeItems: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1.5" y="1.5" width="4" height="4" rx="1" fill="white"/>
                <rect x="8.5" y="1.5" width="4" height="4" rx="1" fill="white" opacity="0.6"/>
                <rect x="1.5" y="8.5" width="4" height="4" rx="1" fill="white" opacity="0.6"/>
                <rect x="8.5" y="8.5" width="4" height="4" rx="1" fill="white" opacity="0.3"/>
              </svg>
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", letterSpacing: 3 }}>
              API EXPLORER
            </span>
          </div>
          <span style={{
            fontSize: 10, color: "rgba(255,255,255,0.18)",
            fontFamily: "'Space Mono', monospace", letterSpacing: 1,
          }}>
            © {new Date().getFullYear()} All Rights Reserved
          </span>
        </div>

        {/* Center: API sources */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { name: "Open Trivia DB", hue: "#FF3CAC" },
            { name: "Dog CEO", hue: "#00F5D4" },
            { name: "Advice Slip", hue: "#FFBE0B" },
            { name: "JokeAPI", hue: "#8B5CF6" },
          ].map((src, i) => (
            <span key={i} style={{
              fontSize: 9, fontFamily: "'Space Mono', monospace",
              letterSpacing: 2, padding: "5px 12px", borderRadius: 2,
              border: `1px solid ${src.hue}22`,
              color: src.hue, background: src.hue + "0a",
            }}>{src.name}</span>
          ))}
        </div>

        {/* Right: Made by */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span style={{
            fontSize: 9, color: "rgba(255,255,255,0.2)",
            fontFamily: "'Space Mono', monospace", letterSpacing: 3,
            textTransform: "uppercase",
          }}>Made by</span>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { name: "Partha Shankar", url: "https://www.linkedin.com/in/parthashankar" },
              { name: "Sachin", url: "https://www.linkedin.com/in/sachin" },
            ].map((person, i) => (
              <a
                key={i}
                href={person.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 10, fontFamily: "'Space Mono', monospace",
                  letterSpacing: 1, color: "#8B5CF6",
                  textDecoration: "none", padding: "4px 10px", borderRadius: 2,
                  border: "1px solid rgba(139,92,246,0.25)",
                  background: "rgba(139,92,246,0.05)",
                  transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", gap: 6,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(139,92,246,0.15)";
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.6)";
                  e.currentTarget.style.color = "#a78bfa";
                  e.currentTarget.style.boxShadow = "0 0 15px rgba(139,92,246,0.3)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(139,92,246,0.05)";
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)";
                  e.currentTarget.style.color = "#8B5CF6";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
                {person.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom line */}
      <div style={{
        marginTop: 40, paddingTop: 24,
        borderTop: "1px solid rgba(255,255,255,0.03)",
        display: "flex", justifyContent: "center",
      }}>
        <span style={{
          fontSize: 9, color: "rgba(255,255,255,0.1)",
          fontFamily: "'Space Mono', monospace", letterSpacing: 3,
        }}>ALL DATA FETCHED LIVE · NO CACHE · NO TRACKING</span>
      </div>
    </footer>
  );
}

/* ─────────────── APP ─────────────── */
export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#08080E", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Crimson+Pro:ital,wght@0,400;0,600;1,400;1,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        ::selection { background: rgba(139,92,246,0.35); color: #fff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #08080E; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.4); border-radius: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes scrollDot { 0%,100%{opacity:0;transform:translateY(0)} 50%{opacity:1;transform:translateY(4px)} }
      `}</style>

      <CursorGlow />
      <NoiseSVG />
      <Nav />
      <Hero />
      <Ticker />
      <GridSection />
      <Footer />
    </div>
  );
}