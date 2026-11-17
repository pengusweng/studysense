"use client";

/**
 * The last fallback, when even the root layout fails: its own document, so it can't rely on the app's styles.
 * The same words as the in-app error, in the notebook's (dark) colours.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#131019",
          color: "#ece7f7",
          colorScheme: "dark",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <main style={{ maxWidth: "32rem" }}>
          <h1 style={{ fontSize: "2rem", lineHeight: 1.1, margin: "0 0 0.75rem" }}>Something went wrong.</h1>
          <p style={{ margin: "0 0 1.5rem", color: "#a7a0bd" }}>Nothing you chose is lost. Try again in a moment.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: 44,
              padding: "0.7rem 1.35rem",
              border: "1.5px solid #c4b0f7",
              borderRadius: 6,
              background: "#c4b0f7",
              color: "#1d1928",
              font: "600 1rem system-ui, sans-serif",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
