import type { Metadata } from "next";
import { notFound } from "next/navigation";

// The 404's title is set here: Next doesn't apply metadata from a nested not-found file.
export const metadata: Metadata = { title: "Page not found · StudySense" };

/** Any address no route claims lands here, so its 404 renders inside the app shell (with the tabs and help). */
export default function Missing() {
  notFound();
}
