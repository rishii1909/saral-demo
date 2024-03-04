import { InferSchemaType, Schema, model } from "mongoose";

// TODO: all typings should be strict
export const MailSchema = new Schema({
  userId: { type: String, required: true },
  text: { type: String },
  html: { type: String },
  headers: { type: Object },
  attributes: { type: Object },
  uid: { type: Number },
  fetchTimeStamp: { type: String, required: true },
});

export type MailTypeWithoutId = InferSchemaType<typeof MailSchema>;

export interface MailType extends MailTypeWithoutId {
  _id: string;
}

export const MailModel = model("Mail", MailSchema);
