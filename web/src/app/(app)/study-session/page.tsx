import type { Metadata } from "next";
import { StudySessionContainer } from "@/features/study-session/containers/StudySessionContainer";

export const metadata: Metadata = { title: "Study Session · StudySense" };

export default function StudySessionPage() {
  return <StudySessionContainer />;
}
