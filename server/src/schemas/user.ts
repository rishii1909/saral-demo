import { InferSchemaType, Schema, model } from "mongoose";
import { AES, enc } from "crypto-js";
import { encryptAES } from "../utils/crypto";

const SALT_ROUNDS = 10;

export const UserSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  appPassword: { type: String, required: true },
  created: { type: Date, default: Date.now },
  lastUID: { type: Number, required: false },
});

UserSchema.pre("save", async function (next) {
  const [hashedPassword, hashedAppPassword] = [
    encryptAES(this.password, this.password),
    encryptAES(this.appPassword, this.password),
  ];
  this.password = hashedPassword;
  this.appPassword = hashedAppPassword;
  next();
});

export type UserTypeWithoutId = InferSchemaType<typeof UserSchema>;

export interface UserType extends UserTypeWithoutId {
  _id: string;
}

export const UserModel = model("user", UserSchema);
