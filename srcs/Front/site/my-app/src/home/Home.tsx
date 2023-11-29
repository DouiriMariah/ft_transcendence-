import './Home.css';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import Header from '../Header';
import LiveModal from '../live/LiveModal';
import { useSocket } from '../SocketContext';

const styles = {
  playButtonColor: "#1e9bff",
  chatButtonColor: "#ff6b6b",
  profileButtonColor: "#5eead4",
  liveButtonColor: "#ffff00",
};

function Home():JSX.Element {
  const socket = useSocket();
  const [security, setSecurity] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  if (!security && !localStorage.getItem("userName")) {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/auth/security";
    fetch(final, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
      .then((response) => {
        if (!response.ok) {
          localStorage.setItem("connected", "no");
          navigate('/');
        }
        else
        {
          return response.json();
        }
      })
      .then((data) => {
        if(data.message === "ExpiredToken by me")
        {
          localStorage.setItem("connected", "no");
          socket.disconnect();

          navigate('/');
        }
        if (data.data) {
          localStorage.setItem("userName", data.data.nickname);
          localStorage.setItem("avatar", data.data.avatar);
          if (data.data.password_A2f) {
            localStorage.setItem("2AF", "not empty")
          }
          setSecurity(true);
        }
        // else {
          // localStorage.setItem("connected", "no");
          // navigate('/error');
        // }
      })
      //il faut ajouter ce catch a toutes nos request au cas ou pas de cookies
      .catch((error) => {
        localStorage.setItem("connected", "no");
        navigate('/')
      });
    
  }

  const handlePlayButton = ():void => { 
    navigate('/game');
};

  const handleChatButton = ():void => { navigate('/chat'); };
  const handleProfileButton = ():void => { navigate('/profile'); };
  const handleLiveButton = ():void => {
    socket.emit("room_list");
    setIsModalOpen(true);
  };
  const playbtnStyle = { "--clr": styles.playButtonColor } as React.CSSProperties;
  const livebtnStyle = { "--clr": styles.liveButtonColor } as React.CSSProperties;
  const chatbtnStyle = { "--clr": styles.chatButtonColor } as React.CSSProperties;
  const profilebtnStyle = { "--clr": styles.profileButtonColor } as React.CSSProperties;
  return (
    <div>
      <Header />
      <div className="container">
        <button className="playbutton" style={playbtnStyle} onClick={handlePlayButton}><span>play</span></button>
        <button className="playbutton" style={livebtnStyle} onClick={handleLiveButton}><span>live</span></button>
        <LiveModal onClose={() => setIsModalOpen(false)} show={isModalOpen}></LiveModal>
        <button className="playbutton" style={chatbtnStyle} onClick={handleChatButton}><span>chat</span></button>
        <button className="playbutton" style={profilebtnStyle} onClick={handleProfileButton}><span>profile</span></button>
      </div>
    </div>
  );
};

export default Home;