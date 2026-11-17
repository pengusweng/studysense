import type { Metadata } from "next";
import { AppShell } from "@/components/organisms/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudySense",
  description: "An empathic academic support system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
