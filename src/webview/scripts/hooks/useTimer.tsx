import Timer from "easytimer.js";
import { useState } from "react";

export function useTimer() {
  const [timer] = useState(
    new Timer({
      countdown: true,
      startValues: { hours: 0, minutes: 0, seconds: 15 },
    })
  );

  return timer;
}
