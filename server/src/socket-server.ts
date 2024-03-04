import { WebSocketServer } from "ws";

const server = new WebSocketServer({
  port: 3002,
});

server.on("connection", (socket, request) => {
  const { url } = request;
  const urlParams = new URLSearchParams(url);
  const id = urlParams.get("id");

  socket.on("error", (error) => console.log(error));
});
