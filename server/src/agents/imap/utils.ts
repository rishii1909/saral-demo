import imap from "imap-simple";
import { writeEmailLog } from "../../utils/logs";

const commonConfig = {
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false,
  },
  authTimeout: 3000,
};

/**
 * Initiates an IMAP connection to gmail server using user's credentials
 * Opens user's inbox
 * Returns connection to save in the store
 * @param email
 * @param appPassword
 * @returns IMAP connection
 */
export const initiateImapConnection = async (
  email: string,
  appPassword: string
) => {
  const imapConfig = { ...commonConfig, user: email, password: appPassword };

  const connection = await imap.connect({ imap: imapConfig });
  writeEmailLog(email, "IMAP connection established successfully");

  await connection.openBox("INBOX");

  return connection;
};

export const getPastMailsSearchCriteria = (days: number = 7) => {
  const rewindMilliSeconds = days * 24 * 3600 * 1000;
  const rewindDateString = getRewindDateString(rewindMilliSeconds);

  return [["SINCE", rewindDateString]];
};

const getRewindDateString = (rewindMilliSeconds: number) => {
  const rewindDate = new Date();
  rewindDate.setTime(Date.now() - rewindMilliSeconds);
  return rewindDate.toISOString();
};
