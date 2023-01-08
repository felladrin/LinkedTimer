import { ActionIcon, Anchor, Box, Center, Col, CopyButton, Grid, TextInput, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy, IconRefresh } from "@tabler/icons";
import { usePubSub } from "create-pubsub/react";
import { clearConnectedPeerIdsOnLastSession, instantiatePeer, peerPubSub } from "../constants/peer";
import { monospaceFontFamily } from "../constants/strings";

export function InviteInput() {
  const [peer] = usePubSub(peerPubSub);

  const inviteId = peer ? peer.id : "Obtaining ID...";

  return (
    <TextInput
      value={inviteId}
      size="xs"
      sx={{ fontFamily: monospaceFontFamily }}
      readOnly
      description={
        <Grid grow justify="flex-end" align="center">
          <Col span={8} py={5}>
            Ask people to join using this ID.
          </Col>
          <Col span="content" ta="right" py={5}>
            <Anchor
              component="button"
              type="button"
              onClick={() => {
                clearConnectedPeerIdsOnLastSession();
                instantiatePeer(true);
              }}
            >
              <Center inline>
                <IconRefresh size={12} />
                <Box ml={5}>Refresh ID</Box>
              </Center>
            </Anchor>
          </Col>
        </Grid>
      }
      rightSection={
        <CopyButton value={inviteId} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="right">
              <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      }
    />
  );
}
