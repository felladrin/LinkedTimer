declare module "bittorrent-tracker/client" {
  import EventEmitter from "node:events";
  /** BitTorrent tracker client. Find torrent peers, to help a torrent client participate in a torrent swarm. */
  export default class Client extends EventEmitter {
    constructor(opts: { peerId: Buffer; announce: string[]; infoHash: string });
    /** Send a `start` announce to the trackers. */
    start(opts?: { numwant?: number }): void;
    /** Send a `stop` announce to the trackers. */
    stop(opts?: { numwant?: number }): void;
    /** Send a `update` announce to the trackers. */
    update(opts?: { numwant?: number }): void;
    /** Destroy all trackers. */
    destroy(): void;
  }
}
