import t from "../../type.module.css";
import { Spread } from "../molecules/Spread";
import s from "./Sections.module.css";

/** The quiet passage: a page left blank on purpose, because not interrupting is a designed outcome. */
export function SilenceSpread() {
  return (
    <Spread
      id="silence"
      labelledBy="silence-title"
      folio={6}
      left={
        <div className={s.blank}>
          <p className={`${t.pencil} ${s.blankNote}`}>This page is left blank on purpose.</p>
        </div>
      }
      right={
        <div className={s.silence}>
          <h2 id="silence-title" className={t.title}>
            Silence is an outcome
          </h2>
          <p className={t.prose}>
            When StudySense decides not to prompt, nothing appears. No pop-up, no badge, no reminder. You can still
            ask for help any time.
          </p>
        </div>
      }
    />
  );
}
