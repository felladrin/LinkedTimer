import { useEffect } from "react";
import halfmoon from "halfmoon";

export function StickyAlertsContainer() {
  useEffect(() => halfmoon.onDOMContentLoaded(), []);
  return <div className="sticky-alerts"></div>;
}