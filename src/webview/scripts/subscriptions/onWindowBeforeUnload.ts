import { leaveRoom } from "../constants/room";

window.addEventListener("beforeunload", () => leaveRoom());
