import { LogTable, type LogRow } from "@/components/molecules/LogTable";
import { formatParticipant, formatRecordDate, type DemoRecord, type RecordCheck } from "@/lib/demoRecord";
import styles from "./SetupPages.module.css";

type Props = { record: DemoRecord; check: RecordCheck };

/** The left page: what the demo works from, in the log voice. Nothing here is a choice. */
export function UsedPage({ record, check }: Props) {
  const rows: LogRow[] = [
    { label: "Source", value: "SSAQS demo dataset" },
    {
      label: "Record",
      value:
        check === "checking"
          ? "Loading demo record…"
          : `${formatParticipant(record.participant)} · ${formatRecordDate(record.date)}`,
      note: check === "unavailable" ? "Unavailable. You can still study; no estimate will be shown." : undefined,
    },
    { label: "Recorded with", value: "Fitbit Inspire 3" },
    { label: "Status", value: "replayed, not live" },
  ];

  return (
    <>
      <h1 id="setup-title" className={styles.title} data-enter>
        What StudySense uses
      </h1>
      <p className={styles.lede} data-enter>
        StudySense runs as a demo. Here is what it works from.
      </p>
      <LogTable rows={rows} label="Demo data source" />
      <p className={styles.prose} data-enter>
        No watch is paired, and nothing is measured from you. Each session replays one recorded day from the SSAQS
        dataset: Fitbit readings and questionnaires from university students who took part in a published study.
      </p>
      <p className={styles.prose} data-enter>
        The readings belong to that participant, not to you. Anything StudySense suggests from them is tentative, and
        you can correct or ignore it.
      </p>
    </>
  );
}
