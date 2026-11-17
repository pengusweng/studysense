import { Button } from "@/components/atoms/Button";

type Props = { value: number; selected: boolean; onSelect: (v: number) => void };

export function ScaleButton({ value, selected, onSelect }: Props) {
  return (
    <Button type="button" aria-pressed={selected} onClick={() => onSelect(value)} style={{ fontWeight: selected ? 700 : 400 }}>
      {value}
    </Button>
  );
}
