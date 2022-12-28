import { ReactNode } from "react";
import { PeerContext } from "../constants";
import { usePeer } from "../hooks/usePeer";

export function PeerProvider({ children }: { children: ReactNode }) {
  const peerState = usePeer();

  return <PeerContext.Provider value={peerState}>{children}</PeerContext.Provider>;
}
