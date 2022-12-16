import { usePubSub } from "create-pubsub/react";
import { currentScreenPubSub } from "../../../constants";
import { CurrentScreen } from "../../../enumerations";
import { JoinScreen } from "./JoinScreen/JoinScreen";
import { TimerScreen } from "./TimerScreen/TimerScreen";
import { InitialScreen } from "./InitialScreen/InitialScreen";

export function CurrentScreenPresenter() {
  const [currentScreen] = usePubSub(currentScreenPubSub);

  switch (currentScreen) {
    case CurrentScreen.JoinScreen:
      return <JoinScreen />;
    case CurrentScreen.TimerScreen:
      return <TimerScreen />;
    case CurrentScreen.InitialScreen:
    default:
      return <InitialScreen />;
  }
}