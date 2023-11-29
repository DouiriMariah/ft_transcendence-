import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './DropdownMenu.css';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../SocketContext';


const DropdownMenu = ({ status_user }:{status_user:string}):JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const nickname = localStorage.getItem("userName");
  const avatar = localStorage.getItem('avatar')!;
  const navigate = useNavigate();
  const dropdownRef = useRef<any>();
  const socket = useSocket();

  const handleToggle = ():void => {
    setIsOpen(!isOpen);
  };

  const logOut = ():void => {
    socket.disconnect();
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/auth/logout";
    fetch(final, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
      .then((response) => response.json())
      .then((data) => {
        if(data.message === "ExpiredToken by me")
        {
        // console.log("pas de cookies les gars");
        localStorage.setItem("connected", "no");
        socket.disconnect();

        navigate('/');
        }        
        if (data) {
          localStorage.removeItem("userName");
          localStorage.removeItem("avatar");
          localStorage.removeItem("2AF");
          localStorage.removeItem("connected");
        }
      });
  }

  useEffect(():void => {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/users";
    fetch(final, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nickname, }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if(data.message === "ExpiredToken by me")
        {
        // console.log("pas de cookies les gars");
        localStorage.setItem("connected", "no");
        socket.disconnect();
        navigate('/');
        }        
      })
  }, [nickname, navigate, socket]);

  const handleClickOutside = (event:MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button className="dropdown-toggle" onClick={handleToggle}>
        <img src={avatar} alt="avatar" />
        <span className={`dot ${status_user === 'ingame' ? "ingame" : "online"}`}></span>
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/game">Game</Link></li>
          <li><Link to="/chat">Chat</Link></li>
          <li><Link to="/options">Options</Link></li>
          <li><Link to="/" className='red' onClick={logOut}>Logout</Link></li>
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;