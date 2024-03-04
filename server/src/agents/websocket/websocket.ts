import WebSocket from "ws";
import { Notification } from "./notification";

export class WebSocketAgent {
  websockets: WebSocket[] = [];

  constructor(websockets: WebSocket[] = []) {
    if (websockets.length === 0) return;

    this.websockets.push(...websockets);
  }

  addWebsocket(webSocket: WebSocket) {
    webSocket.on("close", () => this.removeWebSocket(webSocket));
    this.websockets.push(webSocket);
  }

  removeWebSocket(websocket: WebSocket) {
    const index = this.websockets.indexOf(websocket);

    if (index !== -1) {
      this.websockets.splice(index, 1);
    }
  }

  broadcastNotification(notification: Notification) {
    const notificationString = JSON.stringify(notification);

    this.websockets.map((websocket) => websocket.send(notificationString));
  }
}
