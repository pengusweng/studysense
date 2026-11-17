import { Button } from "@/components/atoms/Button";
import type { SelfReport } from "../../types";
import { ScaleInput } from "../molecules/ScaleInput";

type Props = {
  values: SelfReport;
  onChange: (key: keyof SelfReport, value: number) => void;
  onSubmit: () => void;
  submitting: boolean;
};

export function SelfReportForm({ values, onChange, onSubmit, submitting }: Props) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <ScaleInput label="How stressed do you feel today?" value={values.stress} onChange={(v) => onChange("stress", v)} />
      <ScaleInput label="How anxious do you feel today?" value={values.anxiety} onChange={(v) => onChange("anxiety", v)} />
      <Button type="submit" disabled={submitting}>Submit</Button>
    </form>
  );
}
