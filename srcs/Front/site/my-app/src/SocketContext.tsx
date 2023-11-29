import React, { createContext, useContext } from 'react';
import io, { Socket } from 'socket.io-client';


const SocketContext = createContext<Socket>(io("http://" + window.location.hostname + ":4000", { autoConnect: false, }));

export function SocketProvider({ children }:{children:React.ReactNode}) {
  const URL = "http://" + window.location.hostname + ":4000";
  const socket = io(URL, { autoConnect: false, });
  const username = localStorage.getItem("userName");
  if (username) {
    socket.auth = { username };
    socket.connect();
  }
  if (window.location.pathname === "/profile" || window.location.pathname === "/chat" || window.location.pathname === "/game" ) {
    if(username)
        socket.disconnect();
  }
  if(window.location.pathname === "/")
  {
    socket.disconnect();
  }

  return (<SocketContext.Provider value={socket}>{children}</SocketContext.Provider>);
}

export function useSocket() {
  return useContext(SocketContext);
}
