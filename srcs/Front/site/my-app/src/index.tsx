import './index.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './home/Home';
import Profil from './profil/Profil';
import MyProfil from './profil/MyProfil';
import Pong from './game/Pong';
import Register from './register/Register';
import NoPage from './NoPage/NoPage';
import { createRoot } from 'react-dom/client';
import Live from './live/Live';
import BeginChat from './chat/chat';
import { SocketProvider } from './SocketContext';
import Login from './Login';
import LoginA2F from './LoginA2F';
import WaitGame from './game/Play';

function AppWrapper():JSX.Element {
  const isConnected = localStorage.getItem("connected") === "yes";

  return (
  <SocketProvider>
       <Router>
         <Routes>
           <Route path="/" element={<Login />} />
           <Route path="/a2f" element={<LoginA2F />} />
           {isConnected ? (
            <>
            <Route path="/register" element={<Register />} />
              <Route path="/options" element={<Register />} />
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<MyProfil />} />
              <Route path="/profile/:whichProfile" element={<Profil />} />
              <Route path="/game" element={<Pong />} />
              <Route path="/wait" element={<WaitGame />} />
              <Route path="/live/:selectedGame" element={<Live />} />
              <Route path="/chat" element={<BeginChat />} />
              <Route path="*" element={<NoPage />} />
            </>
          ) : <Route path="*" element={<Login />} />}
        </Routes>
      </Router>
    </SocketProvider>
  );
}
;
createRoot(document.getElementById('root') as HTMLInputElement).render(<AppWrapper />);

