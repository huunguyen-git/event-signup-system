import { io, Socket } from "socket.io-client";
import { BASE_URL } from "@/axios/ipConfig";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(BASE_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
    console.log("Socket.io client connected to:", BASE_URL);
  }
  return socket;
};
