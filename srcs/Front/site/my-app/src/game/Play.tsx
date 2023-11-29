import Header from "../Header";
import React, { useEffect, useState } from 'react';
import { useSocket } from '../SocketContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../modal/Modal';

const WaitGame: React.FC = ():JSX.Element => {
    const socket = useSocket();
    const username = localStorage.getItem('userName');
    const [gameStarted] = useState(false);
    const [buttonVisible] = useState(true);
    const [showModal, setshowModal] = useState(false);
    const navigate = useNavigate();

    const handleGameStart = ():void => {
        if (username) {
            socket.auth = { username };
            socket.connect();
        }
        socket.emit("waiting_player");
        setshowModal(true);
    };

    const NoWaitingAnymore = ():void => {
        setshowModal(false);
        if (!gameStarted)
            socket.emit("stop_waiting");
    }

    useEffect(():()=>void => {
        socket.on("Opponent_found", (message) => {
            socket.emit("MyGame");
            navigate('/game');
        });
        return ():void => {
            socket.off('Opponent_found');
        };
    }, [socket, navigate]);

    return (
        <div>
            <Header />
            {buttonVisible && (<button className="big-button" onClick={() => handleGameStart()}><span>PLAY</span></button>)}
            {!gameStarted && <Modal onClose={() => NoWaitingAnymore()} show={showModal}><p>Waiting for another player</p></Modal>}
        </div>
    );
};

export default WaitGame;
