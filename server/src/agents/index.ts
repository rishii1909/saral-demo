import { ImapAgent } from "./imap/imap";
import WebSocket from "ws";
import { WebSocketAgent } from "./websocket/websocket";

interface UserAgentStore {
  [userId: string]: UserAgent;
}

export const userAgentStore: UserAgentStore = {};

export class UserAgent {
  imapAgent: ImapAgent;
  websocketAgent: WebSocketAgent;

  constructor(userId: string, email: string, appPassword: string) {
    this.websocketAgent = new WebSocketAgent();
    this.imapAgent = new ImapAgent(
      userId,
      email,
      appPassword,
      this.websocketAgent
    );
  }
}

export const createUserAgentIfDoesntExist = (
  userId: string,
  email: string,
  appPassword: string
) => {
  if (!!userAgentStore[userId]) return;

  const agent = new UserAgent(userId, email, appPassword);
  userAgentStore[userId] = agent;
};

export const addWebsocketToUserAgent = (
  userId: string,
  websocket: WebSocket
) => {
  if (!!!userAgentStore[userId]) return;
  const { websocketAgent } = userAgentStore[userId];

  websocketAgent.addWebsocket(websocket);
};
