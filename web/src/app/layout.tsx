import type { Metadata } from "next";
import { Nanum_Pen_Script, Red_Hat_Mono, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const print = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-print", display: "swap" });
const log = Red_Hat_Mono({ subsets: ["latin"], variable: "--font-log", display: "swap" });
const hand = Nanum_Pen_Script({ subsets: ["latin"], weight: "400", variable: "--font-hand", display: "swap" });

export const metadata: Metadata = {
  title: "StudySense: the data is a lead, you write the conclusion",
  description:
    "A non-clinical study companion for university students. It reads wearable data as evidence, asks before it assumes, and can choose to stay quiet.",
};

/**
 * Before first paint: marks the document as motion-capable, so scroll reveals can start hidden without
 * ever hiding content from visitors with JS disabled or reduced motion on. StudySense has one theme
 * (dark), set in globals.css, so nothing else runs here.
 */
const motionFlag = `try{if(matchMedia('(prefers-reduced-motion: no-preference)').matches)document.documentElement.dataset.motion='on'}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${print.variable} ${log.variable} ${hand.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
