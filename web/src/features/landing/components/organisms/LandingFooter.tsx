import { Wordmark } from "@/components/atoms/Wordmark";

export function LandingFooter() {
  return (
    <footer
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "var(--proposal-space-5) clamp(0.75rem, 3vw, 2.5rem) var(--proposal-space-6)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: "var(--proposal-space-3)",
        fontSize: "var(--proposal-text-sm)",
        color: "var(--proposal-pencil)",
        boxSizing: "content-box",
      }}
    >
      <Wordmark size="1rem" />
      <span>Research prototype. Demo data: SSAQS dataset, 2025.</span>
    </footer>
  );
}
