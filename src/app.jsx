import "./app.css";

import { useEffect, useRef, useState } from "react";

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

function App() {
  return <CanvasComponent />;
}

function useConnection(receiveCallback) {
  const [socket, setSocket] = useState(null);

  function sendMessage({ x, y, color }) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(`${x},${y},${color}`);
    }
  }

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    setSocket(ws);
    ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      receiveCallback(JSON.parse(String(event.data)));
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return {
    sendMessage,
    socket,
  };
}

function MouseFollower({ follow }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!follow) return;

      setPosition({
        x: event.clientX - 5,
        y: event.clientY - 5,
      });
    };

    // Add event listener to track mouse movement
    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [follow]);

  const style = {
    position: "absolute",
    top: position.y + "px",
    left: position.x + "px",
    width: "10px",
    height: "10px",
    pointerEvents: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  return <div style={style}>X</div>;
}

function CanvasComponent() {
  const gridSettings = {
    width: 10,
    height: 10,
  };

  const [selectedColor, setSelectedColor] = useState("black");
  const [mouseOver, setMouseOver] = useState(false);
  const { sendMessage } = useConnection((grid) => {
    Object.keys(grid).forEach((key) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      const x = Number(key.split(",")[0]);
      const y = Number(key.split(",")[1]);

      ctx.fillStyle = grid[key];
      ctx.fillRect(
        x - gridSettings.width / 2,
        y - gridSettings.height / 2,
        gridSettings.width,
        gridSettings.height
      );
    });
  });

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const drawPixel = (x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(
        x - gridSettings.width / 2,
        y - gridSettings.height / 2,
        gridSettings.width,
        gridSettings.height
      );
    };

    const handleCanvasClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      let x = Math.floor(event.clientX - rect.left);
      let y = Math.floor(event.clientY - rect.top);

      x = x - (x % 10) + 5;
      y = y - (y % 10) + 5;

      drawPixel(x, y, selectedColor);
      sendMessage({ x, y, color: selectedColor });
    };

    canvas.addEventListener("click", handleCanvasClick);

    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, [sendMessage]);

  return (
    <div>
      <MouseFollower follow={mouseOver} />
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{ border: "1px solid #000000", cursor: "none" }}
        onMouseEnter={() => {
          setMouseOver(true);
        }}
        onMouseLeave={() => {
          setMouseOver(false);
        }}
      ></canvas>
      <div style={{ display: "flex" }}>
        {colors.map((color) => (
          <div
            onClick={() => {
              setSelectedColor(color);
            }}
            style={{
              backgroundColor: color,
              width: "20px",
              height: "20px",
              border: "1px solid black",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
