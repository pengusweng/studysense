import type { Metadata } from "next";
import { ComponentsReview } from "@/features/system-review/containers/ComponentsReview";

export const metadata: Metadata = {
  title: "System components (review) · StudySense",
  robots: { index: false, follow: false },
};

/** Not linked from the app: every system component in its states, for design review. */
export default function ComponentsReviewPage() {
  return <ComponentsReview />;
}
