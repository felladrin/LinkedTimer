import { NumberInput } from "@mantine/core";

export function TimerInput(props: {
  label: string;
  value: number;
  max: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <NumberInput
      label={props.label}
      value={props.value}
      max={props.max}
      min={props.min}
      onChange={props.onChange}
      classNames={{ input: "font-family-E1234" }}
      formatter={(value) => value?.padStart(2, "0") as string}
    />
  );
}
