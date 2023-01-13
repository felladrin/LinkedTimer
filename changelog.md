# Change Log

## 3.0.0

- The networking logic has been rewritten. It's easier to link timers now.
- When using the web version, users can share their URL, which allows others to start a timer already-linked timer.
- Timer IDs are shorter now, making them easier to copy and share.

## 2.2.1

- UI improvements.

## 2.2.0

- Now, when opening a timer tab, it will try to automatically reconnect to peers in case the timer has been previously closed in the middle of a session.
- Now it's possible to get a fresh new ID, to completely break links with previous peers.
- Improvements to the UI.

## 2.1.2

- Added Open Graph Meta Tags to the web version.

## 2.1.1

- Added links to source code and changelog in the menu bar.

## 2.1.0

- When disconnected, it will retry connecting once a second, to cover mobile browsers which disconnect when user switch apps.
- When a new connection is established, it will focus the Links tab.
- The input in Join tab now is only cleared when the connection succeeds.
- A notification will be displayed in case of connection errors.
- Added descriptions to Invite and Join input fields.
- Links are now removed after 30 seconds timeout, as some browsers/devices won't inform the timer has been closed.
- When possible, it will use the same ID as in the last time the timer was used.

## 2.0.0

- The user interface has been completely redesigned.
- It now uses a Mesh network topology, allowing users to connect to the network via any node.
- It now informs how many timers are linked.

## 1.4.0

- Transitions now have smooth animations.
- When running in the browser, a link to install the extension in VS Code is displayed.

## 1.3.0

- Add an animated hourglass, displayed when the timer is running.
- Disable zooming on the page.
- Improve disconnection handling.

## 1.2.1

- Small improvements on the application layout.

## 1.2.0

- Inviting others to connect is now easier in the browser, as there's a direct URL to join. And the link is hidden by default, to avoid stealing focus the timer.
- Timer configuration (hours, minutes, seconds) now persists through sessions if Local Storage is available.

## 1.1.0

- Change behavior in VS Code, retaining the timer tab context when it loses focus.

## 1.0.2

- Fix VS Code Browser opening new browser-tabs when changing screens.
- Improve the "Copy Timer ID" button. Now it gives a better feedback when clicked.

## 1.0.1

- Fix the tab title displayed when the time's up, when using it in the browser.

## 1.0.0

- Initial release
