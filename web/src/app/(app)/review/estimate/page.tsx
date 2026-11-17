import type { Metadata } from "next";
import { EstimateReview } from "@/features/study-session/containers/EstimateReview";

export const metadata: Metadata = {
  title: "Estimate states (review) · StudySense",
  robots: { index: false, follow: false },
};

/** Not linked from the app: a review page for the estimate's states while it is not yet in the session. */
export default function EstimateReviewPage() {
  return <EstimateReview />;
}
