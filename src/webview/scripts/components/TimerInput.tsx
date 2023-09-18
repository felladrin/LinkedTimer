import { NumberInput } from "@mantine/core";
import { clockFontFamily } from "../constants/strings";

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
      prefix={props.value < 10 ? "0" : ""}
      max={props.max}
      min={props.min}
      onChange={props.onChange}
      styles={{
        input: {
          fontFamily: clockFontFamily,
        },
      }}
    />
  );
}
