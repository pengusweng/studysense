import { DATA_FACTS } from "../../content";
import t from "../../type.module.css";
import { LogTable } from "@/components/molecules/LogTable";
import { Spread } from "@/components/molecules/Spread";
import s from "./Sections.module.css";

export function DataSpread() {
  return (
    <Spread
      id="data"
      labelledBy="data-title"
      folio={8}
      left={
        <>
          <h2 id="data-title" className={t.title}>
            The data behind the demo
          </h2>
          <p className={t.prose}>
            The demo replays SSAQS (Students’ Stress and Anxiety Questionnaires &amp; Sensors), an existing research
            dataset. No watch is paired; nothing is measured from you.
          </p>
          <LogTable rows={DATA_FACTS} label="SSAQS dataset facts" />
        </>
      }
      right={
        <>
          <h3 className={t.subtitle} style={{ marginTop: 0 }}>
            Readings need reading
          </h3>
          <p className={t.prose}>
            Fitbit’s daily stress score runs opposite to its name: higher means calmer. And the same body signals can
            come from stress, focus, excitement or exercise <cite className={s.cite}>(van der Mee et al., 2025)</cite>.
            So every reading is evidence, not how you feel.
          </p>
        </>
      }
    />
  );
}
