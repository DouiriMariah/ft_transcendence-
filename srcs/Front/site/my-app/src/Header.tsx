import React, { useEffect, useState } from 'react';
import DropdownMenu from './dropdownMenu/DropdownMenu';
import { useNavigate } from 'react-router-dom';
import Modal from './modal/Modal';
import { useSocket } from './SocketContext';
import SearchFriends from './SearchFriends/SearchFriends';
import Loupe from './loupe-blanc-min.png';
import "./sharedTypes"

const Header : React.FC = ():JSX.Element => {
  const socket = useSocket();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [getAll, setGetAll] = useState([]);
  const [timer, setTimer] = useState(0);
  const [display, setDisplay] = useState(false);
  const [invitor, setInvitor] = useState('');
  const [status, setStatus] = useState('');
  const username = localStorage.getItem('userName');
  const navigate = useNavigate();
  const [list, setList] = useState<ft_Session[]>();

  if (localStorage.getItem("userName")) {
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
          // setSecurity(true);
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




  if (username) {
    socket.auth = { username };
    socket.connect();
    if(!list)
    {
      socket.emit("co2");
      socket.emit("update-sessions");
      socket.emit('my-info');
      socket.emit("channels")
    }
    if(window.location.pathname !== "/game")
    {
      socket.emit("EndGame");
    }
    socket.emit("status");
  }

  const PageGame = ():void => { 
    navigate('/game');   
  };
  const goHome = ():void => {
    navigate('/home');
  };

  const AcceptGame = ():void => {
    setDisplay(false);
    socket.emit("GoGame", invitor);
    PageGame();
  }

  const RefuseGame = ():void => {
    setDisplay(false);
  }


  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);

      return () => clearInterval(countdown);
    }
    else
      setDisplay(false);
  }, [timer]);


  useEffect(() => {
    socket.on('users', (users: ft_Session[]) => {
      setList(users);
    });
    
    socket.on("status_user", (my_status:string) => {
      setStatus(my_status);
    })
    socket.on("GameAccepted", () => {
      setTimer(0);
      setDisplay(true);
      setInvitor('');
      navigate('/game');
    })
    socket.on("InviteGame", (opponnent:string) => {
      setDisplay(true);
      if (!invitor) {
        setTimer(30);
        setInvitor(opponnent);
      };
    });
    socket.on('TimeResponseInvite', () => {
      setTimer(30);
      setDisplay(true);
    });
    socket.on("NoGame", () => {
      setDisplay(false);
      setTimer(0);
      setInvitor('');
      RefuseGame();
    });
    return () => {
      socket.off("GameAccepted")
      socket.off('InviteGame');
      socket.off('TimeResponseInvite');
      socket.off('NoGame');
    };
  })

  const GetAll =  () => {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/users/all";
    fetch(final, {
      credentials: 'include',
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if(data.message === "ExpiredToken by me")
        {
          localStorage.setItem("connected", "no");
          socket.disconnect();

          navigate('/');
        }
        let gg = data.data.filter((item:{isBlocked:boolean}) => item.isBlocked === false);
        gg = gg.filter((item:{ImBloqued:boolean}) => item.ImBloqued === false);
        setGetAll(gg);
        setIsModalOpen(true);
      })
  }
  return (
    <header>
      <div className="left-section">
        <button className="modal-button" onClick={GetAll}><img src={Loupe.toString()} style={{ height: "100%" }} alt="loupe" /></button>
      </div>
      <div className="center-section">
        <h1 className="title" onClick={() => goHome()}>Ft_transcendence</h1>
      </div>
      <Modal onClose={() => RefuseGame()} show={display} title="Let's Play">
        {invitor && (
          <>
            <button onClick={() => AcceptGame()}>Accept Invite</button>
            <button onClick={() => RefuseGame()}>Refuse Invite</button>
          </>
        )}
      </Modal>
      <DropdownMenu status_user={status} />
      <SearchFriends users={getAll} show={isModalOpen}  onClose={() => setIsModalOpen(false)} />
    </header>
  )
}

export default Header;