import { ReactNode } from "react";
import { TimerContext } from "../constants";
import { useTimer } from "../hooks/useTimer";

export function TimerProvider({ children }: { children: ReactNode }) {
  const timer = useTimer();

  return <TimerContext.Provider value={timer}>{children}</TimerContext.Provider>;
}
