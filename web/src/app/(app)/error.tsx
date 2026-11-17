"use client";

import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { NoticePage } from "@/components/organisms/NoticePage";

/**
 * When a screen fails to render. It says so plainly, keeps the student's choices (they live in this tab's
 * storage, untouched by the failure), and offers a retry. No codes or stack traces.
 */
export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <NoticePage title="Something went wrong on this page." line="Nothing you chose is lost. Try again, or go back to the Dashboard.">
      <Button onClick={reset}>Try again</Button>
      <Link href="/dashboard">Go to the Dashboard</Link>
    </NoticePage>
  );
}
