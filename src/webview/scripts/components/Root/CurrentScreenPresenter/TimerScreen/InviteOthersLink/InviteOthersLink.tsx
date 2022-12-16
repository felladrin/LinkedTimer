import { usePubSub } from "create-pubsub/react";
import { hostTimerIdPubSub, isRunningInVsCodeWebview } from "../../../../../constants";
import { useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

export function InviteOthersLink() {
  const [hostTimerId] = usePubSub(hostTimerIdPubSub);
  const [hasJustCopiedTimerId, setJustCopiedTimerId] = useState(false);

  useEffect(() => {
    let timeoutId = 0;
    if (hasJustCopiedTimerId) {
      timeoutId = window.setTimeout(() => setJustCopiedTimerId(false), 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [hasJustCopiedTimerId]);

  const addressToJoin = isRunningInVsCodeWebview ? hostTimerId : `${location.origin}/join/${hostTimerId}`;

  const handleCopyButtonClicked = () => setJustCopiedTimerId(true);

  return (
    <details className="collapse-panel w-400 mw-full mt-20">
      <summary className="collapse-header">Invite others to join!</summary>
      <div className="collapse-content">
        <div className="input-group">
          <input type="text" className="form-control" value={addressToJoin} readOnly />
          <div className="input-group-append">
            <CopyToClipboard text={addressToJoin} onCopy={handleCopyButtonClicked}>
              <button className="btn" type="button">
                {hasJustCopiedTimerId ? <>&#10003;</> : <>&#128203;</>}
              </button>
            </CopyToClipboard>
          </div>
        </div>
      </div>
    </details>
  );
}