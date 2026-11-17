import { DATA_FACTS } from "../../content";
import t from "../../type.module.css";
import { LogTable } from "../molecules/LogTable";
import { Spread } from "../molecules/Spread";
import s from "./Sections.module.css";

export function DataSpread() {
  return (
    <Spread
      id="data"
      labelledBy="data-title"
      folio={10}
      left={
        <>
          <h2 id="data-title" className={t.title}>
            The data behind the demo
          </h2>
          <p className={t.prose}>
            The demo runs on SSAQS (Students’ Stress and Anxiety Questionnaires &amp; Sensors), an existing research
            dataset.
          </p>
          <LogTable rows={DATA_FACTS} label="SSAQS dataset facts" />
        </>
      }
      right={
        <>
          <h3 className={t.subtitle} style={{ marginTop: 0 }}>
            Replayed, not live
          </h3>
          <p className={t.prose}>
            The demo plays back these recorded days. No watch is paired, nothing syncs, and nothing on screen is
            measured from you.
          </p>

          <h3 className={t.subtitle}>Readings need reading</h3>
          <p className={t.prose}>
            Fitbit’s daily stress score runs opposite to its name: a higher score means more physiological resilience.
            And physiological arousal can come from stress, focus, excitement or exercise{" "}
            <cite className={s.cite}>(van der Mee et al., 2025)</cite>. That’s why every reading is treated as
            evidence, not as how you feel.
          </p>

          <h3 className={t.subtitle}>Two kinds of answers, kept apart</h3>
          <p className={t.prose}>
            The stress and anxiety scores participants reported in SSAQS are what the model learns from. They are
            never shown as if you had typed them. What you tell the app during a session is separate, and optional.
          </p>
        </>
      }
    />
  );
}
