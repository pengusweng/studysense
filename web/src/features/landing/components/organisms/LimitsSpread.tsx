import { ButtonLink } from "@/components/atoms/ButtonLink";
import { BOUNDARIES } from "../../content";
import t from "../../type.module.css";
import { Strike } from "../atoms/Strike";
import { Spread } from "../molecules/Spread";
import s from "./Sections.module.css";

export function LimitsSpread() {
  return (
    <Spread
      id="limits"
      labelledBy="limits-title"
      folio={10}
      left={
        <>
          <h2 id="limits-title" className={t.title}>
            What it won’t do
          </h2>
          <ul className={s.limits}>
            {BOUNDARIES.map((item, i) => (
              <li key={item} className={s.limit}>
                {/* Struck one by one as the spread opens; the text stays in full Ink so every commitment reads clearly. */}
                <Strike struck srSuffix="" muted={false} drawDelay={650 + i * 160}>
                  {item}
                </Strike>
              </li>
            ))}
          </ul>
        </>
      }
      right={
        <div className={s.close}>
          <div>
            <h2 className={t.displaySm}>See the whole loop on a real participant-day</h2>
            <p className={t.prose}>Walk through one recorded day, from estimate to feedback.</p>
            <div className={s.closeActions}>
              <ButtonLink href="/dashboard">Open the demo</ButtonLink>
            </div>
          </div>
          <p className={`${s.help} ${t.pencil}`}>
            StudySense is a research prototype, not a medical or psychological tool. If you need support right now,
            talk to someone you trust or contact your university’s counselling services.
          </p>
        </div>
      }
    />
  );
}
