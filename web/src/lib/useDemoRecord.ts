"use client";

import { useEffect, useState } from "react";
import { useDemoRecordValue, type DemoDays, type DemoRecord, type RecordCheck } from "./demoRecord";
import { demoRecordService } from "./demoRecordService";

/** The selected demo record, the list of replayable days, and whether the selection can be replayed. */
export function useDemoRecord() {
  const [record, setRecord] = useDemoRecordValue();
  const [days, setDays] = useState<DemoDays | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    demoRecordService
      .getDays()
      .then((d) => alive && setDays(d))
      .catch(() => alive && setLoadFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  let check: RecordCheck = "checking";
  if (loadFailed) check = "unavailable";
  else if (days) check = days[record.participant]?.includes(record.date) ? "available" : "unavailable";

  return {
    record,
    days,
    check,
    choose: (next: DemoRecord) => setRecord(next),
  };
}
