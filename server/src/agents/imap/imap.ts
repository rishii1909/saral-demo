import imap, { ImapSimple as Connection } from "imap-simple";
import { getPastMailsSearchCriteria, initiateImapConnection } from "./utils";
import { writeEmailLog } from "../../utils/logs";
import { ParsedMail, simpleParser } from "mailparser";
import { UserModel } from "../../schemas/user";
import { MailModel, MailTypeWithoutId } from "../../schemas/mail";
import { respond } from "../../utils/response";
import WebSocket from "ws";
import { WebSocketAgent } from "../websocket/websocket";

const PAST_DAYS = 7;

const fetchOptions = {
  bodies: ["HEADER", ""],

  markSeen: false,
};

export class ImapAgent {
  userId: string;
  email: string;
  websocketAgent: WebSocketAgent;
  // Only lives in memory
  private appPassword: string;
  private lastUID: number | undefined;

  // Always use this.getConnection to obtain IMAP connection, do not access this.connection directly.
  private connection: Connection | undefined = undefined;

  isReady: boolean = false;
  // This ensures that no calls are made before connection is ready
  // We need this because a constructor cannot be async, so we use a lock-logic instead
  connectionReadyCallback: ((connection: Connection) => void) | undefined;

  constructor(
    userId: string,
    email: string,
    appPassword: string,
    websocketAgent: WebSocketAgent
  ) {
    this.userId = userId;
    this.email = email;
    this.appPassword = appPassword;
    this.websocketAgent = websocketAgent;

    this.startConnection();
  }

  // Returns connection if it exists or waits for it to be initiated
  private async getConnection(): Promise<Connection> {
    if (this.connection) return this.connection;

    return new Promise<Connection>(
      (resolve) => (this.connectionReadyCallback = resolve)
    );
  }

  async startConnection() {
    const connection = await initiateImapConnection(
      this.email,
      this.appPassword
    );

    // Write IMAP webhook
    connection.on("mail", async () => {
      writeEmailLog(this.email, "Received new mail notification on webhook");
      const newMails = await this.syncNewMails();
      await this.setLastUID(newMails);
      await this.saveMails(newMails);

      if (!this.lastUID) return;
      this.websocketAgent.broadcastNotification({
        type: "new-mail",
        uid: this.lastUID,
      });
    });

    this.connection = connection;

    // Handle any pending requests for connection
    if (this.connectionReadyCallback) {
      this.connectionReadyCallback(connection);
      this.connectionReadyCallback = undefined;
    }
    this.isReady = true;

    await this.syncLastUID();

    const outOfSyncMails = !!this.lastUID
      ? await this.syncNewMails(false)
      : await this.fetchPastMails();

    await this.setLastUID(outOfSyncMails);
    await this.saveMails(outOfSyncMails);
  }

  async endConnection() {
    if (!this.connection) return;
    writeEmailLog(this.email, "Ending IMAP connection gracefully");
    return this.connection.end();
  }

  async restartConnection() {
    await this.endConnection();
  }

  async fetchPastMails() {
    const searchCriteria = getPastMailsSearchCriteria(PAST_DAYS);

    writeEmailLog(this.email, `${PAST_DAYS}-day fetch started`);

    const pastMails = await this.fetchAndParseMails(searchCriteria);

    writeEmailLog(
      this.email,
      `${PAST_DAYS}-day fetch completed with ${pastMails.length} new emails`
    );

    return pastMails;
  }

  private async fetchAndParseMails(
    searchCriteria: string[][]
  ): Promise<MailTypeWithoutId[]> {
    const connection = await this.getConnection();

    const messages = await connection.search(searchCriteria, fetchOptions);

    const parsedMails = await Promise.all(
      messages.map(async (message) => {
        const { attributes, parts } = message;

        const rawMail = parts.find((part) => part.which === "")!;
        const headers = parts.find((part) => part.which === "HEADER");

        const parsedMail = await simpleParser(rawMail.body);
        const mailData: MailTypeWithoutId = {
          userId: this.userId,
          text: parsedMail.text?.toString(),
          html: parsedMail.html.toString(),
          headers: headers?.body,
          attributes,
          uid: attributes.uid,
          fetchTimeStamp: new Date().toISOString(),
        };

        return mailData;
      })
    );

    return parsedMails;
  }

  async setLastUID(mails: MailTypeWithoutId[]) {
    const lastUID = mails[mails.length - 1].uid;
    if (lastUID) {
      await UserModel.updateOne({ email: this.email }, { lastUID: lastUID });
      this.lastUID = lastUID;
    }
  }

  async saveMails(mails: MailTypeWithoutId[]) {
    await MailModel.insertMany(mails);
    writeEmailLog(this.email, `Saved ${mails.length} new mails to db`);
  }

  async syncLastUID() {
    const user = await UserModel.findOne({ email: this.email }).select(
      "lastUID"
    );
    this.lastUID = user ? user.lastUID || undefined : undefined;
  }

  // For this logic, ideally it's better to have lastUIDs for each user in a redis-like store for fast reads & performing write operation to mongoose to update value AFTER read happens from redis for better speed.
  async syncNewMails(shouldSyncLastUID: boolean = true) {
    if (shouldSyncLastUID) await this.syncLastUID();
    if (!this.lastUID) return [];

    const searchCriteria = [["UID", `${this.lastUID + 1}:*`]];

    writeEmailLog(this.email, `Sync started from UID: ${this.lastUID}`);

    const newEmails = await this.fetchAndParseMails(searchCriteria);

    writeEmailLog(
      this.email,
      `Sync completed for ${newEmails.length} new mails`
    );

    return newEmails;
  }
}
