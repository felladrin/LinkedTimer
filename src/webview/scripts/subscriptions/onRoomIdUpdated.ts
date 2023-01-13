import { onRoomIdUpdated } from "../constants/room";

onRoomIdUpdated((roomId) => {
  window.location.hash = `#${roomId}`;
});
