const WebSocket = require("ws");
const fs = require("fs");

const colors = [
  "aqua",
  "black",
  "blue",
  "fuchsia",
  "gray",
  "green",
  "lime",
  "maroon",
  "navy",
  "olive",
  "purple",
  "red",
  "silver",
  "teal",
  "white",
  "yellow",
];

let grid = {};

const data = fs.readFileSync("data.json");
grid = JSON.parse(data);

const server = new WebSocket.Server({ port: 8080 });

server.on("connection", (ws) => {
  console.log(server.clients.size, "connected users");
  ws.send(JSON.stringify(grid));

  ws.on("message", (message) => {
    let key = "";
    let color = "";
    try {
      if (!message) throw new Error("Message is null");
      message = String(message);
      if (!message) throw new Error("Message is null");
      if (message.length > 16) throw new Error("Message is too long.");
      key = message.split(",")[0] + "," + message.split(",")[1];
      color = message.split(",")[2];

      if (
        parseInt(message.split(",")[0]) >= 0 &&
        parseInt(message.split(",")[0]) <= 500 &&
        parseInt(message.split(",")[1]) >= 0 &&
        parseInt(message.split(",")[1]) <= 500 &&
        colors.includes(message.split(",")[2])
      ) {
      } else {
        throw new Error("Position or color are wrong.");
      }

      grid[key] = color;
      GRID_CHANGED();
    } catch (err) {
      console.log("ERROR: ", err);
    }
  });

  ws.on("close", () => {
    console.log(server.clients.size, "connected users");
  });
});

const broadcastMessage = (message) => {
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const GRID_CHANGED = async () => {
  broadcastMessage(JSON.stringify(grid));
  fs.promises.writeFile("data.json", JSON.stringify(grid));
};

setInterval(() => {}, 5000);

console.log("[1/1] WebSocket server is running on ws://localhost:8080");
