import { Anchor, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { WEBRTC_SUPPORT } from "simple-peer";

export function NoWebRtcSupportModal() {
  const [isModalOpened, modal] = useDisclosure(!WEBRTC_SUPPORT);

  return (
    <Modal opened={isModalOpened} onClose={modal.close} title="WebRTC is not supported in this browser!">
      This will prevent you from connecting to other users. To solve this, use a{" "}
      <Anchor href="https://caniuse.com/rtcpeerconnection" target="_blank" rel="noreferrer">
        browser with WebRTC support
      </Anchor>
      .
    </Modal>
  );
}
