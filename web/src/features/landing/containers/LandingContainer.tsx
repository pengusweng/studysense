"use client";

import { useCheckIn } from "../hooks/useCheckIn";
import { useActiveSection, useRevealOnScroll, useScrolled } from "../hooks/useLandingMotion";
import { DataSpread } from "../components/organisms/DataSpread";
import { HeroSpread } from "../components/organisms/HeroSpread";
import { HowItDecidesSpread } from "../components/organisms/HowItDecidesSpread";
import { LandingFooter } from "../components/organisms/LandingFooter";
import { LandingNav, type NavSection } from "../components/organisms/LandingNav";
import { LimitsSpread } from "../components/organisms/LimitsSpread";
import { ProfilesSpread } from "../components/organisms/ProfilesSpread";
import { SilenceSpread } from "../components/organisms/SilenceSpread";

const SECTIONS: NavSection[] = [
  { id: "how", label: "How it decides" },
  { id: "profiles", label: "Profiles" },
  { id: "silence", label: "Silence" },
  { id: "data", label: "The data" },
  { id: "limits", label: "What it won’t do" },
];

const SECTION_IDS = SECTIONS.map((s) => s.id);

export function LandingContainer() {
  const { answer, outcome, setAnswer, reset } = useCheckIn();
  const active = useActiveSection(SECTION_IDS);
  const scrolled = useScrolled();
  useRevealOnScroll();

  return (
    <>
      <LandingNav sections={SECTIONS} active={active} scrolled={scrolled} />
      <main>
        <HeroSpread answer={answer} outcome={outcome} onAnswer={setAnswer} onReset={reset} />
        <HowItDecidesSpread />
        <ProfilesSpread />
        <SilenceSpread />
        <DataSpread />
        <LimitsSpread />
      </main>
      <LandingFooter />
    </>
  );
}
