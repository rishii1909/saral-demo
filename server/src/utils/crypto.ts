import { AES, enc } from "crypto-js";

export const encryptAES = (text: string, key: string) => {
  return AES.encrypt(text, key).toString();
};

export const decryptAES = (hashedText: string, key: string) => {
  return AES.decrypt(hashedText, key).toString(enc.Utf8);
};

export const obtainAppPassword = (
  hashedAppPassword: string,
  plainAccountPassword: string
) => {
  return decryptAES(hashedAppPassword, plainAccountPassword);
};
