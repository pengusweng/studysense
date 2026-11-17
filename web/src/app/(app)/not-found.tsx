import { NotFoundNotice } from "@/components/organisms/NotFoundNotice";

/** Unknown addresses (via the catch-all route), including the retired /self-report. The shell stays around it. */
export default function AppNotFound() {
  return <NotFoundNotice />;
}
