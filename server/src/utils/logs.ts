export const writeEmailLog = (email: string, message: string) => {
  return writeTimeStampedLog(`${email}: ${message}`);
};

const writeTimeStampedLog = (content: string) => {
  return console.log(`[${new Date().toISOString()}] ${content}`);
};
