import './Live.css';
import Header from '../Header';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../SocketContext';

const Live = (): JSX.Element => {
    const socket = useSocket();
    const navigate = useNavigate();
    const { selectedGame } = useParams();
    const decodedSelectedGame = decodeURIComponent(selectedGame!);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [player1Score, setPlayer1Score] = useState(0);
    const [player2Score, setPlayer2Score] = useState(0);
    const Height = 600;
    const Width = 800;
    const [ballY, setBallY] = useState(Height / 2);
    const [ballX, setBallX] = useState(Width / 2);
    const paddleWidth = 100;
    const [paddle1Y, setPaddle1Y] = useState(Height / 2 - (paddleWidth / 2));
    const [paddle2Y, setPaddle2Y] = useState(Height / 2 - (paddleWidth / 2));
    const ballRadius = 6;
    const array_name = decodedSelectedGame.split("_");

    const username = localStorage.getItem("userName");
    if(username)
        socket.connect();

    const drawAll = ():void => {
        if (canvasRef.current)
        {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return;

            ctx.fillStyle = "#333";
            ctx.fillRect(0, 0, Width, Height);

            ctx.strokeStyle = "#fff";
            ctx.setLineDash([10]);
            ctx.beginPath();
            ctx.moveTo(Width / 2, 0);
            ctx.lineTo(Width / 2, Height);
            ctx.stroke();

            ctx.font = "30px Orbitron";
            ctx.fillStyle = "#888";
            ctx.fillText(array_name[0], ((Width / 2) / 2), 30);
            ctx.fillText(player1Score.toString(), ((Width / 2) / 2), 100);
            ctx.fillText(array_name[1], ((Width / 2) * 1.5), 30);
            ctx.fillText(player2Score.toString(), ((Width / 2) * 1.5), 100);

            ctx.fillStyle = "#e34444";
            ctx.fillRect(0, paddle1Y, 10, paddleWidth);

            ctx.fillStyle = "#ff0000";
            ctx.fillRect(Width - 10, paddle2Y, 10, paddleWidth);

            ctx.beginPath();
            ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = "#00ff00";
            ctx.fill();
            if (player1Score === 11 || player2Score === 11) {
                socket.off('gameStateBall');
                socket.off("gameStatePaddle");
                socket.off('spectatorJoin');
                navigate('/home');
            }
        }
    };

    const spectatorRoomName = `spectator_${decodedSelectedGame}`;
    socket.emit("spectatorJoin", spectatorRoomName);

    useEffect(():()=>void => {
        socket.on('gameStateBall', (message) => {
            setBallX(message.ballX);
            setBallY(message.ballY);
        });
        return ():void => {
            socket.off('gameStateBall');
            socket.off("spectatorJoin");
        };
    },);

    useEffect(():()=>void => {
        socket.on("gameStatePaddle", (message) => {
            setPaddle1Y(message.paddle1Y);
            setPaddle2Y(message.paddle2Y);
        });
        return ():void => {
            socket.off("gameStatePaddle");
        }
    },);

    useEffect(():()=>void => {
        socket.on("gameStateScore", (message) => {
            setPlayer1Score(message.player1Score);
            setPlayer2Score(message.player2Score);
        });
        return () => {
            socket.off("ScoreResponse");
            socket.off("spectatorJoin");
        };
    })

    const LiveLoop = ():null => {
        useEffect(() => {
            const liveLoop = setInterval(() => {
                drawAll();
            }, 1000 / 600);
            return ():void => {
                clearInterval(liveLoop);
            }
        });
        return null;
    };

    return (
        <div>
            <Header />
            <canvas ref={canvasRef} width={Width} height={Height} id="gameCanvas" />
            <LiveLoop />
        </div>
    );
};

export default Live;