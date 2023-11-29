import './Live.css';
import { CSSTransition } from 'react-transition-group';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../SocketContext';


interface LiveModalProps {
  show: boolean;
  onClose: () => void;
}

const LiveModal: React.FC<LiveModalProps> = (props) => {
  const socket = useSocket();
  const [rooms, setRoomList] = useState<string[] | null>(null);


  useEffect(():()=>void => {
    const handleListRoom = (list: string[]) => {
      setRoomList(list);
    };

    socket.on('List_room', handleListRoom);

    return () => {
      socket.off('List_room', handleListRoom);
    };
  }, [socket]);

  const closeOnEscapeKeyDown = (e:KeyboardEvent) => {
    if ((e.key || e.code) === 'Escape') {
      props.onClose();
    }
  };
  
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleGameSelect = (game:string):void => {
    setSelectedGame(game);
  };

  const handleConfirm = () : void => {
    if (selectedGame) {
      navigate(`/live/${encodeURIComponent(selectedGame)}`);
    }
  };

  useEffect(():()=>void => {
    document.body.addEventListener("keydown", closeOnEscapeKeyDown);
    return function cleanup() {
      document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
    };
  },);
  return (
    <CSSTransition
      in={props.show}
      unmountOnExit
      timeout={{ enter: 0, exit: 300 }}
    >
      <div className='livemodal'>
        <div className='livemodal-content'>
          <h2 className='livemodal-title'>Choose a Pong Game</h2>
          <ul>
            
            {rooms && rooms.map((room:string, index:number) => (
              <li key={index} onClick={() => handleGameSelect(room)}>{room}</li>
            ))}
          </ul>
          <button onClick={handleConfirm}>Confirm</button>
          <button onClick={props.onClose}>Cancel</button>
        </div>
      </div>
    </CSSTransition>
  );
};

export default LiveModal;