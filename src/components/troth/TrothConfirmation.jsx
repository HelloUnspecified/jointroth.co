import React, { useState, useEffect } from "react";

/* ============================================================================
   Troth waitlist confirmation page (/welcome).

   A dedicated route — a distinct pageview for analytics and the highest-intent
   moment in the funnel: acknowledge → invite your spouse (the primary,
   Troth-specific referral) → know another couple → expectation-setting →
   sign-off. Structure and copy per the design brief.

   Rendered inside the same iPhone frame chrome as the landing so it reads as one
   continuous app. The small design-system primitives it needs are duplicated
   here so this page ships without pulling in the whole landing bundle.
   ============================================================================ */

function LanternMark({ size = 40, tone = "brand", style = {}, ...rest }) {
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

function Button({
  children,
  variant = "primary",
  size = "medium",
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
      {children}
    </button>
  );
}

function TextField({ style = {}, ...rest }) {
  const [focus, setFocus] = useState(false);
  return (
    <input
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: 17,
        color: "var(--color-text)",
        width: "100%",
        boxSizing: "border-box",
        outline: "none",
        background: "var(--color-surface-sunken)",
        border: "1px solid transparent",
        borderRadius: "var(--radius-input)",
        padding: "13px 16px",
        boxShadow: focus ? "0 0 0 3px rgba(174,100,78,0.18)" : "none",
        transition:
          "border-color var(--dur-quick) var(--ease-troth), box-shadow var(--dur-quick) var(--ease-troth)",
        ...style,
      }}
      {...rest}
    />
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

/* ---- The confirmation content -------------------------------------------- */
// Warm, on-brand copy for a failed submission (no exclamation points).
function subscribeError(status) {
  if (status === 429)
    return "A lot of people are joining right now — give it a moment and try again.";
  return "Something went wrong on our end. Please try again in a moment.";
}

function Confirmation() {
  const [spouseEmail, setSpouseEmail] = useState("");
  const [spouseSent, setSpouseSent] = useState(false);
  const [spouseBusy, setSpouseBusy] = useState(false);
  const [spouseErr, setSpouseErr] = useState("");
  const [copied, setCopied] = useState(""); // "spouse" | "couple" | ""

  async function sendSpouse(e) {
    e.preventDefault();
    setSpouseErr("");
    setSpouseBusy(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: spouseEmail, ref: "spouse" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setSpouseSent(true);
        return;
      }
      setSpouseErr(subscribeError(res.status));
    } catch (err) {
      setSpouseErr(
        "We couldn't reach the server. Check your connection and try again.",
      );
    }
    setSpouseBusy(false);
  }

  async function copyLink(which) {
    try {
      await navigator.clipboard.writeText("https://jointroth.co");
    } catch (err) {
      /* clipboard blocked — the visible link is the fallback */
    }
    setCopied(which);
    setTimeout(() => setCopied((c) => (c === which ? "" : c)), 2200);
  }

  return (
    <div
      style={{
        minHeight: "100svh",
        padding: "58px 30px 96px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Subtle back link to the landing page */}
      <a
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          alignSelf: "flex-start",
          marginBottom: 30,
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--color-text-tertiary)",
          textDecoration: "none",
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to the page
      </a>

      {/* Acknowledge */}
      <div className="troth-os" style={{ textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 22,
          }}
        >
          <LanternMark size={34} tone="brand" />
        </div>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(34px,9vw,46px)",
            lineHeight: 1.06,
            letterSpacing: "-0.014em",
            color: "var(--color-text)",
            margin: 0,
          }}
        >
          You're on the list.
        </h1>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 18,
            lineHeight: 1.6,
            color: "var(--color-text-secondary)",
            margin: "18px auto 0",
            maxWidth: "24rem",
            textWrap: "pretty",
          }}
        >
          Thank you. Please check your inbox in the next minute to confirm. I've
          also written you a note about what happens next.
        </p>
      </div>

      <div
        className="troth-os"
        style={{
          height: 1,
          background: "var(--color-border)",
          margin: "40px 0 34px",
          animationDelay: "0.1s",
        }}
      />

      {/* Invite your spouse — the primary referral moment */}
      <div
        className="troth-os"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderLeft: "3px solid var(--color-letter)",
          borderRadius: 12,
          padding: "22px 22px 24px",
          animationDelay: "0.16s",
        }}
      >
        <div style={{ ...eyebrowStyle, color: "var(--color-letter)" }}>
          The most important step
        </div>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(26px,7vw,32px)",
            lineHeight: 1.12,
            letterSpacing: "-0.008em",
            color: "var(--color-text)",
            margin: "12px 0 0",
          }}
        >
          Invite your spouse.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 16.5,
            lineHeight: 1.6,
            color: "var(--color-text-secondary)",
            margin: "14px 0 0",
            textWrap: "pretty",
          }}
        >
          Troth only works with the two of you together. We want your spouse's
          feedback too.
        </p>

        <div style={{ marginTop: 18 }}>
          {!spouseSent ? (
            <form
              onSubmit={sendSpouse}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              <TextField
                type="email"
                required
                value={spouseEmail}
                onChange={(e) => setSpouseEmail(e.target.value)}
                placeholder="Your spouse's email"
                aria-label="Your spouse's email"
              />
              <Button
                variant="primary"
                size="large"
                type="submit"
                style={{ width: "100%" }}
                disabled={spouseBusy}
              >
                {spouseBusy ? "Sending…" : "Send them an invite"}
              </Button>
              {spouseErr && (
                <p
                  role="alert"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: "var(--color-accent)",
                    margin: "2px 0 0",
                  }}
                >
                  {spouseErr}
                </p>
              )}
            </form>
          ) : (
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                border: "1px solid var(--color-border-strong)",
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              <LanternMark size={18} tone="brand" />
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 16,
                  lineHeight: 1.45,
                  color: "var(--color-text)",
                }}
              >
                Sent. Please ask your spouse to check their inbox and confirm.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Know another couple? — softer secondary referral */}
      <div
        className="troth-os"
        style={{ marginTop: 30, animationDelay: "0.24s" }}
      >
        <div style={{ ...eyebrowStyle, color: "var(--color-text-tertiary)" }}>
          Spread the word
        </div>
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(22px,6vw,26px)",
            lineHeight: 1.18,
            color: "var(--color-text)",
            margin: "10px 0 0",
          }}
        >
          Know another couple?
        </h3>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--color-text-secondary)",
            margin: "12px 0 16px",
            textWrap: "pretty",
          }}
        >
          We build Troth in partnership with the couples on this list. Every
          voice shapes what we make. If you know another couple who might care
          about what we're building, send them the link.
        </p>
        <Button variant="secondary" onClick={() => copyLink("couple")}>
          {copied === "couple" ? "Link copied" : "Copy link"}
        </Button>
      </div>

      {/* Expectation-setting + sign-off */}
      <div
        className="troth-os"
        style={{
          marginTop: 34,
          paddingTop: 24,
          borderTop: "1px solid var(--color-border)",
          animationDelay: "0.3s",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 15.5,
            lineHeight: 1.6,
            color: "var(--color-text-secondary)",
            margin: 0,
            textWrap: "pretty",
          }}
        >
          We're opening access to Troth carefully, a few couples at a time as we
          build. When it's your turn, you'll hear from me at least 48 hours
          before.
        </p>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 15.5,
            lineHeight: 1.6,
            color: "var(--color-text-secondary)",
            margin: "12px 0 0",
            textWrap: "pretty",
          }}
        >
          Have a question? Reply to any email from me. I read them all.
        </p>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--color-text-secondary)",
            margin: "18px 0 0",
          }}
        >
          — Clark
        </p>
      </div>

      {/* Footer */}
      <div
        className="troth-os"
        style={{
          textAlign: "left",
          fontFamily: "var(--font-sans)",
          fontSize: 11.5,
          color: "var(--color-text-tertiary)",
          display: "flex",
          gap: 10,
          justifyContent: "left",
          alignItems: "left",
          flexWrap: "wrap",
          animationDelay: "0.36s",
        }}
      >
        <a href="mailto:clark@jointroth.co">clark@jointroth.co</a>
      </div>
    </div>
  );
}

/* ---- Page: phone-frame shell + confirmation ------------------------------- */
export default function TrothConfirmation() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("troth-dark"));
  }, []);

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

  const frameOffset = "clamp(0px,3.5vw,40px)";

  return (
    <div
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
        @keyframes troth-rise {0%{opacity:0;transform:translateY(15px)}100%{opacity:1;transform:none}}
        .troth-os {opacity:0;animation:troth-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards}
        @media (prefers-reduced-motion: reduce){
          .troth-os{opacity:1 !important;animation:none !important}
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

        <Confirmation />
      </div>
    </div>
  );
}
