import React, { useState, useEffect } from "react";

/* ============================================================================
   Troth waitlist landing page.

   Faithful port of the Claude Design file "Troth Landing Page.dc.html" into a
   React island. The design-system primitives below are recreated 1:1 from the
   Troth design-system bundle (LanternMark, Button, TextField, Avatar,
   KeepsakeSeal, MessageBubble, QuestionCard, OnThisDayCard, ManifestoEntry,
   SectionMarker). Tokens live in src/css/troth-tokens.css.

   The page is presented inside an iPhone frame so it reads as a preview of the
   app it's launching — full-bleed on a real phone (clamp collapses the padding
   and radius to 0), a centered device frame on desktop.
   ============================================================================ */

/* ---- Brand ---------------------------------------------------------------- */
function LanternMark({ size = 40, tone = "brand", style = {}, ...rest }) {
  // tone: "brand" (terracotta + plum), "mono" (currentColor), "cream"
  const c =
    tone === "brand"
      ? ["#A24B34", "#7A2E39"]
      : tone === "cream"
        ? ["var(--cream)", "var(--cream)"]
        : ["currentColor", "currentColor"];
  return (
    <svg
      width={size * 1.6}
      height={size}
      viewBox="0 0 64 40"
      fill="none"
      role="img"
      aria-label="Troth"
      style={style}
      {...rest}
    >
      <path
        d="M18.5 6.2c4.1 0 7 6.4 7 14.1 0 7.7-2.9 13.9-7 13.9s-7-6.2-7-13.9c0-7.7 2.9-14.1 7-14.1Z"
        fill={c[0]}
      />
      <path
        d="M39.5 6.2c4.1 0 7 6.4 7 14.1 0 7.7-2.9 13.9-7 13.9s-7-6.2-7-13.9c0-7.7 2.9-14.1 7-14.1Z"
        fill={c[1]}
      />
    </svg>
  );
}

function KeepsakeSeal({ size = 34, style = {}, ...rest }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 38% 34%, #D8B25C, var(--color-keepsake) 62%, #8A6420)",
        boxShadow: "var(--shadow-seal)",
        flex: "none",
        ...style,
      }}
      role="img"
      aria-label="Sealed keepsake"
      {...rest}
    >
      <LanternMark size={size * 0.35} tone="cream" />
    </span>
  );
}

/* ---- Primitives ----------------------------------------------------------- */
function SectionMarker({ tone = "tertiary", children, style = {}, ...rest }) {
  const colors = {
    accent: "var(--color-accent)",
    letter: "var(--color-letter)",
    tertiary: "var(--color-text-tertiary)",
  };
  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: colors[tone] || colors.tertiary,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

function Button({
  children,
  variant = "primary",
  size = "medium",
  icon,
  iconRight,
  disabled = false,
  style = {},
  ...rest
}) {
  const [pressed, setPressed] = useState(false);
  const [hover, setHover] = useState(false);
  const pads = { large: "16px 28px", medium: "13px 22px", small: "9px 16px" };
  const fonts = { large: 17, medium: 15, small: 13 };
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "var(--font-sans)",
    fontSize: fonts[size],
    fontWeight: 500,
    padding: pads[size],
    borderRadius: "var(--radius-input)",
    cursor: disabled ? "default" : "pointer",
    border: "1px solid transparent",
    transition:
      "background var(--dur-quick) var(--ease-troth), color var(--dur-quick) var(--ease-troth), transform var(--dur-quick) var(--ease-troth)",
    transform: pressed ? "scale(0.98)" : "none",
    opacity: disabled ? 0.4 : 1,
    lineHeight: 1,
    whiteSpace: "nowrap",
  };
  const variants = {
    primary: {
      background: hover ? "var(--color-accent-press)" : "var(--color-accent)",
      color: "var(--color-text-on-accent)",
    },
    secondary: {
      background: hover ? "rgba(138,63,41,0.06)" : "transparent",
      color: "var(--color-text)",
      borderColor: "var(--color-border-strong)",
    },
    text: {
      background: "transparent",
      color: "var(--color-accent)",
      padding: size === "small" ? "4px 4px" : "6px 4px",
      textDecoration: hover ? "underline" : "none",
      textUnderlineOffset: 3,
    },
  };
  return (
    <button
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPressed(false);
      }}
      style={{ ...base, ...variants[variant], ...style }}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

function TextField({
  variant = "filled",
  multiline = false,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  const shared = {
    fontFamily: "var(--font-sans)",
    fontSize: 17,
    color: "var(--color-text)",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
    transition:
      "border-color var(--dur-quick) var(--ease-troth), box-shadow var(--dur-quick) var(--ease-troth)",
  };
  const looks =
    variant === "line"
      ? {
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${focus ? "var(--color-accent)" : "var(--color-border-strong)"}`,
          borderRadius: 0,
          padding: "8px 0",
        }
      : {
          background: "var(--color-surface-sunken)",
          border: "1px solid transparent",
          borderRadius: "var(--radius-input)",
          padding: "13px 16px",
          boxShadow: focus ? "0 0 0 3px rgba(174,100,78,0.18)" : "none",
        };
  const props = {
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: { ...shared, ...looks, ...style },
    ...rest,
  };
  return multiline ? (
    <textarea rows={rest.rows || 4} {...props} />
  ) : (
    <input {...props} />
  );
}

function Avatar({ initial, tone = "plum", size = 36, style = {}, ...rest }) {
  const tones = {
    plum: "var(--color-letter)",
    terracotta: "var(--color-accent)",
    forest: "var(--forest)",
    neutral: "var(--border-strong)",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        flex: "none",
        background: tones[tone] || tone,
        color: "var(--cream)",
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        fontSize: size * 0.4,
        letterSpacing: "0.01em",
        ...style,
      }}
      {...rest}
    >
      {initial}
    </span>
  );
}

/* ---- Content -------------------------------------------------------------- */
function MessageBubble({
  children,
  from = "them",
  initial,
  tone = "plum",
  keepsake = false,
  style = {},
  ...rest
}) {
  const mine = from === "me";
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        justifyContent: mine ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        ...style,
      }}
      {...rest}
    >
      {!mine && initial && <Avatar initial={initial} tone={tone} size={36} />}
      <div style={{ position: "relative", maxWidth: "72%" }}>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 17,
            lineHeight: 1.4,
            color: "var(--color-text)",
            background: mine ? "rgba(162,75,52,0.16)" : "var(--color-surface)",
            border: mine
              ? "1px solid transparent"
              : "1px solid var(--color-border)",
            padding: "12px 16px",
            borderRadius: 18,
            borderBottomRightRadius: mine ? 6 : 18,
            borderBottomLeftRadius: mine ? 18 : 6,
          }}
        >
          {children}
        </div>
        {keepsake && (
          <KeepsakeSeal
            size={30}
            style={{
              position: "absolute",
              top: -12,
              right: mine ? -10 : "auto",
              left: mine ? "auto" : -10,
            }}
          />
        )}
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  primaryLabel = "Answer together",
  secondaryLabel,
  onPrimary,
  onSecondary,
  style = {},
  ...rest
}) {
  return (
    <div
      style={{
        background: "var(--color-surface-sunken)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        padding: "20px 22px",
        ...style,
      }}
      {...rest}
    >
      <SectionMarker tone="letter" style={{ marginBottom: 12 }}>
        A question, if you'd like one
      </SectionMarker>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 24,
          lineHeight: 1.3,
          color: "var(--color-text)",
          marginBottom: 18,
        }}
      >
        {question}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <Button onClick={onPrimary}>{primaryLabel}</Button>
        {secondaryLabel && (
          <Button variant="secondary" onClick={onSecondary}>
            {secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

function OnThisDayCard({
  year,
  ago,
  title,
  children,
  photo,
  style = {},
  ...rest
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        padding: 16,
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          width: 108,
          flex: "none",
          borderRadius: 8,
          overflow: "hidden",
          background: photo
            ? `center/cover url(${photo})`
            : "repeating-linear-gradient(135deg, var(--color-surface-sunken) 0 10px, rgba(0,0,0,0.02) 10px 20px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 96,
          fontFamily: "var(--font-serif)",
          fontSize: 22,
          color: "var(--color-text-tertiary)",
        }}
      >
        {!photo && year}
      </div>
      <div>
        <SectionMarker tone="accent" style={{ marginBottom: 8 }}>
          On this day{ago ? ` · ${ago}` : ""}
        </SectionMarker>
        {title && (
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 21,
              lineHeight: 1.25,
              color: "var(--color-text)",
              marginBottom: 4,
            }}
          >
            {title}
          </div>
        )}
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 18,
            lineHeight: 1.45,
            color: "var(--color-text-secondary)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function ManifestoEntry({
  children,
  author,
  date,
  divider = true,
  style = {},
  ...rest
}) {
  return (
    <div
      style={{
        paddingBottom: 24,
        marginBottom: 24,
        borderBottom: divider ? "1px solid var(--color-border)" : "none",
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 24,
          lineHeight: 1.32,
          color: "var(--color-text)",
          letterSpacing: "-0.004em",
        }}
      >
        {children}
      </div>
      {(author || date) && (
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            color: "var(--color-text-tertiary)",
            marginTop: 14,
          }}
        >
          {[author, date].filter(Boolean).join(" · ")}
        </div>
      )}
    </div>
  );
}

/* ---- Small inline chrome --------------------------------------------------- */
function SectionEyebrow({ children, tone = "accent" }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color:
          tone === "tertiary"
            ? "var(--color-text-tertiary)"
            : "var(--color-accent)",
      }}
    >
      {children}
    </div>
  );
}

const eyebrowStyle = {
  fontFamily: "var(--font-sans)",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--color-accent)",
};
const h2Style = {
  fontFamily: "var(--font-serif)",
  fontWeight: 400,
  fontSize: "clamp(30px,8vw,40px)",
  lineHeight: 1.1,
  letterSpacing: "-0.01em",
  color: "var(--color-text)",
  margin: "16px 0 0",
  textWrap: "balance",
};
const sectionStyle = {
  scrollSnapAlign: "start",
  minHeight: "100svh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "76px 30px 132px",
};

/* ============================================================================
   Page
   ============================================================================ */
// Warm, on-brand copy for a failed signup (no exclamation points).
function subscribeError(status) {
  if (status === 429)
    return "A lot of people are joining right now — give it a moment and try again.";
  return "Something went wrong on our end. Please try again in a moment.";
}

const errorTextStyle = {
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  lineHeight: 1.5,
  color: "var(--color-accent)",
  margin: "2px 0 0",
};

export default function TrothLanding() {
  const [dark, setDark] = useState(false);
  const [current, setCurrent] = useState(0);
  const [email, setEmail] = useState("");
  const [email2, setEmail2] = useState("");
  const [busy, setBusy] = useState(false);
  const [busy2, setBusy2] = useState(false);
  const [err, setErr] = useState("");
  const [err2, setErr2] = useState("");
  // Screens whose content has entered view (so it rises into place once, and
  // stays put when scrolling back up). Screen 0 is the hero — it plays its own
  // load animation, so it starts "shown".
  const [shown, setShown] = useState(() => new Set([0]));
  // Gates the reveal CSS: only active after hydration so content is never
  // hidden for no-JS / SSR crawlers.
  const [mounted, setMounted] = useState(false);

  // Keep local state in sync with the theme the FOUC script may have applied.
  useEffect(() => {
    setDark(document.documentElement.classList.contains("troth-dark"));
    setMounted(true);
  }, []);

  // Track the screen in view — drives the progress dots and the per-screen
  // reveal animation.
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const n = parseInt(e.target.getAttribute("data-screen"), 10);
          if (isNaN(n)) return;
          // Reveal a little before the screen is centered.
          if (e.intersectionRatio >= 0.2) {
            setShown((prev) => (prev.has(n) ? prev : new Set(prev).add(n)));
          }
          // Mark the active screen once it dominates the viewport.
          if (e.intersectionRatio >= 0.5) setCurrent(n);
        });
      },
      { threshold: [0.2, 0.5, 0.75] },
    );
    document.querySelectorAll("[data-screen]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // troth-screen: screens 1–6 (the hero keeps its own load animation).
  const screenClass = (i) => `troth-screen${shown.has(i) ? " is-shown" : ""}`;

  function toggleTheme() {
    const d = !dark;
    setDark(d);
    document.documentElement.classList.toggle("troth-dark", d);
    if (d) document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.setItem("troth-theme", d ? "dark" : "light");
    } catch (e) {}
  }

  function goTo(n) {
    const el = document.getElementById("screen-" + n);
    if (el) {
      const top = el.getBoundingClientRect().top + (window.scrollY || 0);
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  async function join(value, setBusy, setErr) {
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        // Success — send them to the confirmation page (its own pageview).
        window.location.assign("/welcome");
        return;
      }
      setErr(subscribeError(res.status));
    } catch (e) {
      setErr(
        "We couldn't reach the server. Check your connection and try again.",
      );
    }
    setBusy(false);
  }

  function dotStyle(i) {
    const active = current === i;
    return {
      width: active ? 22 : 8,
      height: 8,
      borderRadius: 999,
      border: "none",
      padding: 0,
      cursor: "pointer",
      background: active ? "var(--color-accent)" : "var(--color-border-strong)",
      transition:
        "width 380ms var(--ease-troth), background 380ms var(--ease-troth)",
    };
  }

  const frameOffset = "clamp(0px,3.5vw,40px)";

  return (
    <div
      className={mounted ? "troth-js" : undefined}
      style={{
        minHeight: "100vh",
        background: "var(--color-canvas)",
        display: "flex",
        justifyContent: "center",
        padding: `${frameOffset} ${frameOffset}`,
        transition: "background var(--dur-considered) var(--ease-troth)",
      }}
    >
      <style>{`
        /* Firm snapping so the page rests on one full screen at a time,
           like paging through an app rather than scrolling a website. */
        html { scroll-snap-type: y mandatory; scroll-padding-top: 0; }
        @keyframes troth-ignite {0%{opacity:0;transform:scale(0.82)}100%{opacity:1;transform:scale(1)}}
        @keyframes troth-rise {0%{opacity:0;transform:translateY(15px)}100%{opacity:1;transform:none}}
        @keyframes troth-nudge {0%,100%{transform:translateY(0);opacity:0.45}50%{transform:translateY(5px);opacity:1}}
        .troth-os {opacity:0;animation:troth-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards}

        /* Each screen's content rises into place as it snaps into view.
           Gated on .troth-js so it never hides content without JS. Decorative
           (aria-hidden) layers are left alone. */
        .troth-js .troth-screen > *:not([aria-hidden="true"]) {
          opacity: 0;
          transform: translateY(16px);
          transition:
            opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .troth-js .troth-screen.is-shown > *:not([aria-hidden="true"]) {
          opacity: 1;
          transform: none;
        }
        .troth-js .troth-screen.is-shown > *:nth-child(2){transition-delay:0.03s}
        .troth-js .troth-screen.is-shown > *:nth-child(3){transition-delay:0.06s}
        .troth-js .troth-screen.is-shown > *:nth-child(4){transition-delay:0.09s}
        .troth-js .troth-screen.is-shown > *:nth-child(5){transition-delay:0.12s}
        .troth-js .troth-screen.is-shown > *:nth-child(6){transition-delay:0.15s}
        .troth-js .troth-screen.is-shown > *:nth-child(n+7){transition-delay:0.18s}

        @media (prefers-reduced-motion: reduce){
          html{scroll-snap-type:none !important}
          .troth-os{opacity:1 !important;animation:none !important}
          [data-troth-ignite]{animation:none !important}
          [data-troth-nudge]{animation:none !important}
          .troth-js .troth-screen > *{opacity:1 !important;transform:none !important;transition:none !important}
        }
        @media (max-height:740px), (max-width:400px){
          .tr-sm-hide{display:none !important}
          .tr-sm-tight{margin-top:20px !important}
        }
      `}</style>

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 462,
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "clamp(0px,3vw,30px)",
          // `clip` (not `hidden`) clips the rounded corners without turning the
          // frame into a scroll container — otherwise the sections would snap
          // against the frame instead of the page and scroll-snap does nothing.
          overflow: "clip",
          transition: "background var(--dur-considered) var(--ease-troth)",
        }}
      >
        {/* iOS status bar */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 58,
            width: "100%",
            height: 46,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 26px",
            borderTopLeftRadius: "clamp(0px,3vw,30px)",
            borderTopRightRadius: "clamp(0px,3vw,30px)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.01em",
              color: "var(--color-text)",
            }}
          >
            9:41
          </span>
          <div
            style={{
              position: "absolute",
              top: 9,
              left: "50%",
              transform: "translateX(-50%)",
              width: 110,
              height: 26,
              background: "#17120E",
              borderRadius: 999,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              color: "var(--color-text)",
            }}
          >
            <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
              <rect x="0" y="8" width="3" height="4" rx="0.8" />
              <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
              <rect x="10" y="3" width="3" height="9" rx="0.8" />
              <rect x="15" y="0.5" width="3" height="11.5" rx="0.8" />
            </svg>
            <svg
              width="17"
              height="12"
              viewBox="0 0 17 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            >
              <path d="M1 4.2C3.1 2.2 5.7 1 8.5 1s5.4 1.2 7.5 3.2" />
              <path d="M3.4 6.9c1.4-1.3 3.2-2 5.1-2s3.7.7 5.1 2" />
              <path d="M6 9.4c.7-.7 1.6-1 2.5-1s1.8.3 2.5 1" />
              <circle
                cx="8.5"
                cy="11.1"
                r="0.7"
                fill="currentColor"
                stroke="none"
              />
            </svg>
            <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
              <rect
                x="0.6"
                y="0.6"
                width="21"
                height="11.8"
                rx="3"
                stroke="currentColor"
                strokeOpacity="0.5"
                strokeWidth="1.1"
              />
              <rect
                x="2.2"
                y="2.2"
                width="16"
                height="8.6"
                rx="1.6"
                fill="currentColor"
              />
              <rect
                x="23"
                y="4"
                width="1.8"
                height="5"
                rx="0.9"
                fill="currentColor"
                fillOpacity="0.5"
              />
            </svg>
          </div>
        </div>

        {/* Lamplight toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle lamplight"
          style={{
            position: "fixed",
            top: `calc(${frameOffset} + 54px)`,
            right: `calc(${frameOffset} + 14px)`,
            zIndex: 55,
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: "var(--color-text-secondary)",
            background: "color-mix(in srgb, var(--color-bg) 70%, transparent)",
            backdropFilter: "blur(10px)",
            border: "1px solid var(--color-border)",
            borderRadius: 999,
            padding: "6px 12px 6px 10px",
            cursor: "pointer",
          }}
        >
          <svg
            width="16"
            height="11"
            viewBox="0 0 64 40"
            fill="none"
            style={{ display: "block" }}
          >
            <path
              d="M18.5 6.2c4.1 0 7 6.4 7 14.1 0 7.7-2.9 13.9-7 13.9s-7-6.2-7-13.9c0-7.7 2.9-14.1 7-14.1Z"
              fill="currentColor"
              opacity="0.55"
            />
            <path
              d="M39.5 6.2c4.1 0 7 6.4 7 14.1 0 7.7-2.9 13.9-7 13.9s-7-6.2-7-13.9c0-7.7 2.9-14.1 7-14.1Z"
              fill="currentColor"
            />
          </svg>
          {dark ? "Light" : "Lamplight"}
        </button>

        {/* S0 — Hero + primary waitlist capture */}
        <section
          id="screen-0"
          data-screen="0"
          style={{ ...sectionStyle, position: "relative" }}
        >
          <div
            aria-hidden="true"
            data-troth-ignite
            style={{
              position: "absolute",
              top: "4%",
              left: "-14%",
              width: "128%",
              height: 400,
              background:
                "radial-gradient(ellipse 58% 52% at 40% 42%, rgba(162,75,52,0.30), rgba(162,75,52,0.05) 55%, rgba(162,75,52,0) 74%)",
              filter: "blur(22px)",
              pointerEvents: "none",
              animation: "troth-ignite 2.4s var(--ease-troth) both",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              className="troth-os"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                marginBottom: 32,
              }}
            >
              <LanternMark size={26} tone="brand" />
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: "0.34em",
                  textTransform: "uppercase",
                  color: "var(--color-text)",
                  paddingLeft: "0.34em",
                }}
              >
                Troth
              </span>
            </div>
            <h1
              className="troth-os"
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontSize: "clamp(37px,9.8vw,54px)",
                lineHeight: 1.04,
                letterSpacing: "-0.015em",
                color: "var(--color-text)",
                margin: 0,
                textWrap: "balance",
                animationDelay: "0.12s",
              }}
            >
              Love isn't a feeling. It's what you{" "}
              <em style={{ fontStyle: "italic", color: "var(--color-accent)" }}>
                do.
              </em>
            </h1>
            <p
              className="troth-os"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 18,
                lineHeight: 1.6,
                color: "var(--color-text-secondary)",
                margin: "22px 0 0",
                textWrap: "pretty",
                animationDelay: "0.26s",
              }}
            >
              A private, encrypted home for your marriage — where the
              conversations, memories, letters, and promises you're keeping all
              live in one place. Coming to iPhone.
            </p>
            <div
              className="troth-os"
              style={{ margin: "30px 0 0", animationDelay: "0.4s" }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  join(email, setBusy, setErr);
                }}
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <TextField
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  aria-label="Your email"
                />
                <Button
                  variant="primary"
                  size="large"
                  type="submit"
                  style={{ width: "100%" }}
                  disabled={busy}
                >
                  {busy ? "Joining…" : "Join the waitlist"}
                </Button>
                {err && (
                  <p role="alert" style={errorTextStyle}>
                    {err}
                  </p>
                )}
              </form>
            </div>
            <p
              className="troth-os"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                lineHeight: 1.6,
                color: "var(--color-text-tertiary)",
                margin: "20px 0 0",
                animationDelay: "0.52s",
              }}
            >
              Built by Clark and Carrie Sell in partnership with couples like
              you who are on this list. Sealed for two, you. Never us. Never
              anyone else.
            </p>
          </div>
          <button
            type="button"
            onClick={() => goTo(1)}
            aria-label="Continue"
            style={{
              position: "absolute",
              bottom: 104,
              left: "50%",
              transform: "translateX(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-tertiary)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              data-troth-nudge
              style={{ animation: "troth-nudge 2s ease-in-out infinite" }}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </section>

        {/* S1 — Who it's for */}
        <section
          id="screen-1"
          data-screen="1"
          className={screenClass(1)}
          style={sectionStyle}
        >
          <SectionEyebrow>Who Troth is for</SectionEyebrow>
          <h2 style={h2Style}>For any marriage worth doing well.</h2>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 17,
              lineHeight: 1.62,
              color: "var(--color-text-secondary)",
              margin: "18px 0 22px",
              textWrap: "pretty",
            }}
          >
            Not only for marriages in crisis, and not only the ones with
            everything figured out. It's for the couples in between — which is
            to say, most of us.
          </p>
          <div
            style={{
              background: "var(--color-surface-sunken)",
              borderRadius: 12,
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 13,
            }}
          >
            {[
              ["Year one", "Still learning to live in the same room."],
              [
                "Year seven",
                "Kids are small; the marriage is easy to overlook.",
              ],
              [
                "Year fifteen",
                "Deciding whether to grow into the next season.",
              ],
              ["Empty nesters", "Figuring out who they are as two again."],
              [
                "Any hard year",
                "Something happened, and now they're rebuilding.",
              ],
            ].map(([label, text]) => (
              <div
                key={label}
                style={{ display: "flex", gap: 14, alignItems: "baseline" }}
              >
                <span
                  style={{
                    flex: "none",
                    fontFamily: "var(--font-sans)",
                    fontSize: 11.5,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "var(--color-accent)",
                    minWidth: 98,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 15.5,
                    lineHeight: 1.45,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--color-text)",
              margin: "20px 0 0",
              textWrap: "pretty",
            }}
          >
            Every one of you belongs here — and the earlier you start, the more
            Troth becomes over the years. It meets the two of you where you are,
            with a gentle question now and then, never a demand.
          </p>
          <div className="tr-sm-hide" style={{ marginTop: 22 }}>
            <QuestionCard
              question="Where did the two of you feel most like a team this week?"
              secondaryLabel="Not today"
            />
          </div>
        </section>

        {/* S2 — The problem */}
        <section
          id="screen-2"
          data-screen="2"
          className={screenClass(2)}
          style={sectionStyle}
        >
          <SectionEyebrow>The problem</SectionEyebrow>
          <h2 style={h2Style}>
            Your marriage has been living in borrowed rooms.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 17,
              lineHeight: 1.64,
              color: "var(--color-text)",
              margin: "18px 0 0",
              textWrap: "pretty",
            }}
          >
            The message that mattered when it arrived. The photo from a trip
            that changed something. Try to find it three years later — it's
            buried in iMessage, Photos, and Notes, under the grocery lists, the
            carpool, the group thread with the in-laws.
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 17,
              lineHeight: 1.64,
              color: "var(--color-text-secondary)",
              margin: "14px 0 0",
              textWrap: "pretty",
            }}
          >
            Your marriage doesn't own any of those apps — it's borrowing space
            in the same place your kids are texting from. Borrowed rooms are
            fine for storage. They're terrible for accumulation.
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 19,
              lineHeight: 1.5,
              color: "var(--color-accent)",
              margin: "22px 0 0",
            }}
          >
            Marriages deserve better than borrowed rooms.
          </p>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <MessageBubble from="them" initial="M" tone="plum" keepsake>
              You were right about waiting on the house. I'm glad we did.
            </MessageBubble>
            <MessageBubble from="me" className="tr-sm-hide">
              I keep thinking about what you said in the car that night.
            </MessageBubble>
            <MessageBubble
              from="them"
              initial="M"
              tone="plum"
              className="tr-sm-hide"
            >
              That we'd figure it out together? I meant every word of it.
            </MessageBubble>
            <MessageBubble from="me">
              Save this one. I don't want to lose it in the thread.
            </MessageBubble>
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11.5,
              color: "var(--color-text-tertiary)",
              marginTop: 12,
              paddingLeft: 2,
            }}
          >
            The conversations that matter most — buried three years deep in a
            group thread.
          </div>
        </section>

        {/* S3 — What Troth is */}
        <section
          id="screen-3"
          data-screen="3"
          className={screenClass(3)}
          style={sectionStyle}
        >
          <SectionEyebrow>What Troth is</SectionEyebrow>
          <h2 style={h2Style}>A room your marriage owns.</h2>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 17,
              lineHeight: 1.6,
              color: "var(--color-text-secondary)",
              margin: "16px 0 24px",
              textWrap: "pretty",
            }}
          >
            One place, built for two people — sealed for you and no one else.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              [
                "Talk without borrowing. ",
                "A private surface — Face ID locked, never on the camera roll.",
              ],
              [
                "Write down what you're building. ",
                "Your values, promises, places, and people — in your own words.",
              ],
              [
                "Remember what matters. ",
                "Letters, milestones, gratitude — kept where they won't get lost.",
              ],
              [
                "See the shape of the marriage. ",
                "Your own timeline — the story the way it actually happened.",
              ],
            ].map(([lead, rest]) => (
              <div
                key={lead}
                style={{ display: "flex", gap: 13, alignItems: "baseline" }}
              >
                <span
                  style={{
                    flex: "none",
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--color-accent)",
                    transform: "translateY(-2px)",
                  }}
                />
                <div>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--color-text)",
                    }}
                  >
                    {lead}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 16,
                      lineHeight: 1.5,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {rest}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <OnThisDayCard
              year="2019"
              ago="5 years ago"
              title="The apartment on Wells Street"
            >
              Where the two of you started — one room, almost no furniture,
              certain of nothing except each other.
            </OnThisDayCard>
          </div>
          <p
            className="tr-sm-hide"
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 17,
              lineHeight: 1.5,
              color: "var(--color-text)",
              margin: "20px 0 0",
              textWrap: "pretty",
            }}
          >
            Nothing borrowed. Nothing buried. Everything the two of you keep, in
            one place.
          </p>
        </section>

        {/* S4 — Sealed for two (dark) */}
        <section
          id="screen-4"
          data-screen="4"
          className={`troth-dark ${screenClass(4)}`}
          style={{
            scrollSnapAlign: "start",
            minHeight: "100svh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "76px 34px 132px",
            background: "var(--color-bg)",
            position: "relative",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "22%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(340px,82%)",
              height: 260,
              background:
                "radial-gradient(ellipse 60% 55% at 50% 42%, rgba(199,154,62,0.20), rgba(199,154,62,0) 70%)",
              filter: "blur(20px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              marginBottom: 26,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 38% 32%, #C79A3E, #9C7523)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 2px 10px -3px rgba(43,38,35,0.5), inset 0 1px 1px rgba(255,255,255,0.35)",
              }}
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2B2623"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-label="Locked and private"
                role="img"
              >
                <rect x="4.5" y="10.5" width="15" height="10" rx="2.4" />
                <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                <circle cx="12" cy="14.6" r="1.5" />
                <path d="M12 16.1v2" />
              </svg>
            </div>
          </div>
          <div style={{ position: "relative", ...eyebrowStyle }}>
            The privacy promise
          </div>
          <h2
            style={{
              position: "relative",
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "clamp(36px,10vw,50px)",
              lineHeight: 1.04,
              letterSpacing: "-0.014em",
              color: "var(--color-text)",
              margin: "14px 0 0",
            }}
          >
            Sealed for two.
          </h2>
          <p
            style={{
              position: "relative",
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              lineHeight: 1.64,
              color: "var(--color-text-secondary)",
              margin: "22px auto 0",
              maxWidth: "25rem",
              textWrap: "pretty",
            }}
          >
            Honesty needs a place where it's safe. What you put in Troth never
            leaves your devices — no cloud, no AI, no company, including ours.
            Just two iPhones, end-to-end encrypted. Only the two of you can open
            the door.
          </p>
        </section>

        {/* S5 — Founder credibility */}
        <section
          id="screen-5"
          data-screen="5"
          className={screenClass(5)}
          style={sectionStyle}
        >
          <SectionEyebrow>How we're building this</SectionEyebrow>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "clamp(25px,6.6vw,33px)",
              lineHeight: 1.16,
              letterSpacing: "-0.006em",
              color: "var(--color-text)",
              margin: "16px 0 24px",
              textWrap: "balance",
            }}
          >
            In partnership with the couples on this list.
          </h2>
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderLeft: "3px solid var(--color-letter)",
              borderRadius: 12,
              padding: "22px 22px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <Avatar initial="C" tone="plum" size={36} />
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--color-letter)",
                  }}
                >
                  A note from Clark
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 12.5,
                    color: "var(--color-text-tertiary)",
                    marginTop: 2,
                  }}
                >
                  Founder · married 23 years
                </div>
              </div>
            </div>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 16.5,
                lineHeight: 1.62,
                color: "var(--color-text)",
                margin: 0,
                textWrap: "pretty",
              }}
            >
              Troth is the tool I wished existed for our own marriage — through
              good chapters and hard ones. The couples on this waitlist are
              shaping what we build.
            </p>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 16.5,
                lineHeight: 1.62,
                color: "var(--color-text-secondary)",
                margin: "12px 0 0",
                textWrap: "pretty",
              }}
            >
              We're opening access carefully, a few couples at a time — so the
              first ones are genuinely served by it. When you sign up, I'll
              write to you personally. Every reply gets read.
            </p>
          </div>
          <div className="tr-sm-hide" style={{ marginTop: 22 }}>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-text-tertiary)",
                marginBottom: 11,
              }}
            >
              What the couples are writing
            </div>
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                padding: "20px 22px 4px",
              }}
            >
              <ManifestoEntry
                author="A couple on the list"
                date="Year 4"
                divider={false}
              >
                We're building a marriage where we say the true thing before it
                hardens.
              </ManifestoEntry>
            </div>
          </div>
        </section>

        {/* S6 — Final waitlist capture */}
        <section
          id="screen-6"
          data-screen="6"
          className={screenClass(6)}
          style={{
            ...sectionStyle,
            padding: "76px 30px 140px",
            position: "relative",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "8%",
              left: "-14%",
              width: "128%",
              height: 360,
              background:
                "radial-gradient(ellipse 58% 52% at 50% 42%, rgba(162,75,52,0.26), rgba(162,75,52,0.05) 55%, rgba(162,75,52,0) 74%)",
              filter: "blur(22px)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <LanternMark size={34} tone="brand" />
            </div>
            <div
              style={{
                textAlign: "center",
                ...eyebrowStyle,
                color: "var(--color-text-tertiary)",
              }}
            >
              Coming to iPhone in 2026
            </div>
            <h2
              style={{
                textAlign: "center",
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontSize: "clamp(32px,8.8vw,44px)",
                lineHeight: 1.06,
                letterSpacing: "-0.012em",
                color: "var(--color-text)",
                margin: "12px 0 0",
              }}
            >
              Keep your place.
            </h2>
            <p
              style={{
                textAlign: "center",
                fontFamily: "var(--font-serif)",
                fontSize: 17,
                lineHeight: 1.58,
                color: "var(--color-text-secondary)",
                margin: "16px auto 0",
                maxWidth: "24rem",
                textWrap: "pretty",
              }}
            >
              The two of you can begin keeping your marriage in one place the
              day access opens.
            </p>
            <div style={{ maxWidth: 360, margin: "28px auto 0" }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  join(email2, setBusy2, setErr2);
                }}
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <TextField
                  type="email"
                  required
                  value={email2}
                  onChange={(e) => setEmail2(e.target.value)}
                  placeholder="Your email"
                  aria-label="Your email"
                />
                <Button
                  variant="primary"
                  size="large"
                  type="submit"
                  style={{ width: "100%" }}
                  disabled={busy2}
                >
                  {busy2 ? "Joining…" : "Join the waitlist"}
                </Button>
                {err2 && (
                  <p role="alert" style={errorTextStyle}>
                    {err2}
                  </p>
                )}
              </form>
            </div>
            <p
              style={{
                textAlign: "center",
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                lineHeight: 1.6,
                color: "var(--color-text-tertiary)",
                margin: "16px auto 0",
                maxWidth: "24rem",
              }}
            >
              We'll never share your address. Unsubscribe anytime.
            </p>
            <p
              style={{
                textAlign: "center",
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 18,
                color: "var(--color-text-secondary)",
                margin: "18px 0 0",
              }}
            >
              Clark & Carrie
            </p>
            <div
              style={{
                textAlign: "center",
                fontFamily: "var(--font-sans)",
                fontSize: 11.5,
                color: "var(--color-text-tertiary)",
                display: "flex",
                gap: 10,
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <a href="mailto:clark@jointroth.co">clark@jointroth.co</a>
            </div>
          </div>
        </section>

        {/* Persistent bottom bar: progress + always-present Join anchor */}
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: "calc(20px + env(safe-area-inset-bottom))",
            transform: "translateX(-50%)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "8px 8px 8px 16px",
            borderRadius: 999,
            background: "color-mix(in srgb, var(--color-bg) 80%, transparent)",
            backdropFilter: "blur(14px)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-float)",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Screen ${i + 1}`}
                style={dotStyle(i)}
              />
            ))}
          </div>
          <Button variant="primary" size="small" onClick={() => goTo(6)}>
            Join the waitlist
          </Button>
        </div>
      </div>
    </div>
  );
}
