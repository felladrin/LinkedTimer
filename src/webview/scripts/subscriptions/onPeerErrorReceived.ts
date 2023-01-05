import { onPeerErrorReceived } from "../constants/peer";
import { showNotification } from "@mantine/notifications";
import { isRunningInVsCodeWebview } from "../constants/booleans";
import { vsCodeApi } from "../constants/vsCodeApi";

onPeerErrorReceived(({ name, message, type }) => {
  if (isRunningInVsCodeWebview) {
    vsCodeApi.postMessage({ informationMessage: `$${name}${type ? ` (${type})` : ""}: ${message}!` });
  } else {
    showNotification({
      title: `${name}${type ? ` (${type})` : ""}`,
      message: message,
      color: "red",
    });
  }
});
