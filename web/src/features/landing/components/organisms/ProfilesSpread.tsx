import { PROFILES } from "../../content";
import t from "../../type.module.css";
import { ProfileGrid } from "../molecules/ProfileGrid";
import { Spread } from "../molecules/Spread";

export function ProfilesSpread() {
  return (
    <Spread
      id="profiles"
      labelledBy="profiles-title"
      folio={6}
      left={
        <ProfileGrid
          profiles={PROFILES}
          caption="Split at 50 on the 0–100 SSAQS self-report scales. That line was set for this course. It is not a clinical boundary."
        />
      }
      right={
        <>
          <h2 id="profiles-title" className={t.title}>
            Four daily profiles, all of them tentative
          </h2>
          <p className={t.prose}>
            The model’s estimate is one of four profiles. It describes a whole day. It is not a reading of how you
            feel right now, and it is never a diagnosis.
          </p>
          <p className={t.prose}>
            Wherever an estimate appears, the app uses words like “may” and “estimated”. It shows what the estimate is
            based on, and you can correct it. When the model has nothing reliable to say, the app says so rather than
            guessing.
          </p>
        </>
      }
      rightFirst
    />
  );
}
