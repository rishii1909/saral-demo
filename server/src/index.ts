import express from "express";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth";
import { mailRouter } from "./routes/mail";
import bodyParser from "body-parser";
import passport from "passport";
import mongoose from "mongoose";
import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { addWebsocketToUserAgent } from "./agents";
import cors from "cors";

dotenv.config();

mongoose.connect(
  "mongodb+srv://admin:NYHiawRty43LWOB5@cluster0.i7uohcs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);
mongoose.connection.on("error", (error) =>
  console.log("Mongoose connection error: ", error)
);
mongoose.Promise = global.Promise;

const webSocketServer = new WebSocketServer({ port: 3002 });

webSocketServer.on(
  "connection",
  (websocket: WebSocket, request: IncomingMessage) => {
    const userId = request.url?.split("/")[1];
    if (!userId) return;

    addWebsocketToUserAgent(userId, websocket);
  }
);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Express + TypeScript Server");
});

app.use("/auth", authRouter);
app.use("/mail", passport.authenticate("jwt", { session: false }), mailRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
