import express from "express";
import { respond } from "../utils/response";
import { MailModel } from "../schemas/mail";

export const mailRouter = express.Router();

const PAGE_SIZE = 10;

mailRouter.post("/list", async (req, res) => {
  const data = req.body;
  const { userId, gtUID: gtUIDSTring, ltUID: ltUIDString } = data;
  const gtUID = parseInt(gtUIDSTring);
  const ltUID = parseInt(ltUIDString);

  const mails = await MailModel.find({
    ...((gtUID || ltUID) && {
      "attributes.uid": {
        ...(gtUID && { $gt: gtUID }),
        ...(ltUID && { $lt: ltUID }),
      },
    }),
    userId,
  })
    .sort("-attributes.uid")
    .limit(PAGE_SIZE)
    .select("uid headers fetchTimeStamp");

  return respond({ res, data: mails });
});

mailRouter.post("/view", async (req, res) => {
  const data = req.body;
  const { userId, uid } = data;
  const mail = await MailModel.findOne({ userId, uid: parseInt(uid) });

  return respond({ res, data: mail });
});
