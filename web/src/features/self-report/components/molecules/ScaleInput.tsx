import { ScaleButton } from "../atoms/ScaleButton";

type Props = { label: string; value: number; onChange: (v: number) => void };

export function ScaleInput({ label, value, onChange }: Props) {
  return (
    <fieldset>
      <legend>{label}</legend>
      {[1, 2, 3, 4, 5].map((n) => (
        <ScaleButton key={n} value={n} selected={n === value} onSelect={onChange} />
      ))}
    </fieldset>
  );
}
