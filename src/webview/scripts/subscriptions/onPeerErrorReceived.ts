import { onPeerErrorReceived } from "../constants/peer";
import { showNotification } from "@mantine/notifications";

onPeerErrorReceived(({ name, message, type }) => {
  showNotification({
    title: `${name}${type ? ` (${type})` : ""}`,
    message: message,
    color: "red",
  });
});
