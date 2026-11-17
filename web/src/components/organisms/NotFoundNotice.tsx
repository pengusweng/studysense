import Link from "next/link";
import { ButtonLink } from "@/components/atoms/ButtonLink";
import { NoticePage } from "./NoticePage";

/** The 404 text and the ways on, shared by the in-shell and the bare not-found pages. */
export function NotFoundNotice() {
  return (
    <NoticePage title="This page isn’t in the notebook." line="The link may be old, or the page was never written.">
      <ButtonLink href="/dashboard">Go to the Dashboard</ButtonLink>
      <Link href="/">Back to the start</Link>
    </NoticePage>
  );
}
