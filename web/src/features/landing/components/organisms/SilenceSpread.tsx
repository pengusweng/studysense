import t from "../../type.module.css";
import { Spread } from "../molecules/Spread";
import s from "./Sections.module.css";

/** The quiet passage: a page left blank on purpose, because not interrupting is a designed outcome. */
export function SilenceSpread() {
  return (
    <Spread
      id="silence"
      labelledBy="silence-title"
      folio={8}
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
            Often the right move is to leave you alone. When StudySense decides not to prompt, that’s a designed state,
            not a missing screen.
          </p>
          <p className={t.prose}>
            No pop-up. No badge. No celebration. No reminder that you skipped something. Your session just carries on,
            and you can still ask for help whenever you want it.
          </p>
        </div>
      }
    />
  );
}
