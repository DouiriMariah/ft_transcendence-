import './Profil.css'
import React, { useState, useEffect } from 'react';
import Header from '../Header';
import GotBeatenUp from './GotBeatenUp.png';
import PongLooser from './PongLooser.png';
import MyFirstWin from './MyFirstWin.png';
import PongLover from './PongLover.png';
import PongMaster from './PongMaster.png';
import { useParams } from 'react-router-dom';
import NoPage from '../NoPage/NoPage';
import '../chat/w3school.css';
import { useNavigate } from 'react-router-dom';
import '../sharedTypes';
import { useSocket } from '../SocketContext';



function Profil(): JSX.Element {
  const { whichProfile } = useParams();
  const decodedProfile = decodeURIComponent(whichProfile!);
  const [visitor, setVisitor] = useState<ft_User>();
  const [matchHistory, setMatchHistory] = useState<ft_MatchHistory[]>();
  const [achivementString, setAchievementString] = useState("");
  const [rank, setRank] = useState(0);
  const [wait, setWait] = useState(false);
  const socket = useSocket();

  let profileToUse = decodedProfile;
  const navigate = useNavigate();


  if (localStorage.getItem("userName") === profileToUse) {
    navigate('/profile');
  }

  const initialAchievements = [
    { id: 1, imgUrl: GotBeatenUp, unlocked: false, text: "Got Beaten Up" },
    { id: 2, imgUrl: PongLooser, unlocked: false, text: "Pong Looser" },
    { id: 3, imgUrl: MyFirstWin, unlocked: false, text: "My First Win" },
    { id: 4, imgUrl: PongLover, unlocked: false, text: "Pong Lover" },
    { id: 5, imgUrl: PongMaster, unlocked: false, text: "Pong Master" },
  ];

  const [achievements, setAchievements] = useState(initialAchievements);

  const BlockUser = (to_block: string|undefined): void => {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/users/block";
    fetch(final, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockedUser: to_block }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // if (data.data === null)
        if (data.message === "ExpiredToken by me") {
          localStorage.setItem("connected", "no");
          navigate('/');
        }

        socket.emit('my-info');
        socket.emit("update-sessions");
        socket.emit("block", to_block);
      })
  }

  const DeblockUser = (name: string|undefined): void => {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/users/deblock";
    fetch(final, {
      credentials: 'include',
      method: 'DELETE',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ deblockUser: name }),
    })
      .then((response): Promise<JSX.Element | any> => {
        return response.json();
      })
      .then((data) => {
        if (data.message === "ExpiredToken by me") {
          localStorage.setItem("connected", "no");
          navigate('/');
        }
        socket.emit("update-sessions");
        socket.emit("my-info");
        socket.emit("block", name);
      })
  }

  const AddFriend = (name: string | undefined): void => {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/users/friends";
    fetch(final, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendName: name }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
      })
  }

  const InviteFriend = (name: string | undefined): void => {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/users/invitefriend";
    fetch(final, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: name, }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((data) => {
        if (data.message === "ExpiredToken by me") {
          localStorage.setItem("connected", "no");
          navigate('/');
        }
      })
  }

  const DeleteFriend = (name: string | undefined): void => {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/users/deletefriend";
    fetch(final, {
      credentials: 'include',
      method: 'DELETE',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ byefriend: name }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.message === "ExpiredToken by me") {
          localStorage.setItem("connected", "no");
          navigate('/');
        }
      })
  }

  useEffect((): void => {
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
        if (data.message === "ExpiredToken by me") {
          localStorage.setItem("connected", "no");
          navigate('/');
        }
        if (data.data) {

          setVisitor(data.data.find((item) => item.user === profileToUse));
          setWait(true);
        }
      })
  }, [profileToUse, visitor, navigate]);

  useEffect((): void => {
    if (visitor) {
      const URL = "http://" + window.location.hostname + ":4000";
      const final = URL + "/users";
      fetch(final, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: visitor.user, }),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.message === "ExpiredToken by me") {
            localStorage.setItem("connected", "no");
            navigate('/');
          }

          if (data.data && data.data.statistic) {
            setMatchHistory(data.data.statistic.player_history);
            if (data.data.statistic.achievement !== achivementString) {
              setAchievementString(data.data.statistic.achievement);
              const idsArray = data.data.statistic.achievement.split("");
              const updatedAchievements = achievements.map((achievement) =>
                idsArray.includes(String(achievement.id))
                  ? { ...achievement, unlocked: true }
                  : achievement
              );
              setAchievements(updatedAchievements);
            }
            setRank(data.data.statistic.rank);
          }
        })
    }
  }, [visitor, achivementString, achievements, rank, matchHistory, navigate]);

  return (
    <div>
      {visitor && (
        <div>
          <Header />
          <div className='box'>
            <div className='first-box'>
              <div className="info">
                <div className="avatar-container">
                  <img src={visitor.avatar} alt="avatar" style={{ float: 'left' }} />
                  <span className={`dot ${visitor.status === "offline" ? 'offline' : (visitor.status === 'online' ? "online" : "ingame")}`}></span>
                </div>
                <div className='name' style={{ float: 'left' }}>{visitor.user}</div>
                <div className='name' style={{ float: 'right' }}>Points: {rank}</div>
              </div>
              <div >
                {visitor.isFriend === true && (visitor.ImBloqued === false && visitor.isBlocked === false) ? (
                  <button onClick={() => DeleteFriend(visitor.user)}>Remove Friend</button>
                ) : visitor.Already_invite && (visitor.ImBloqued === false && visitor.isBlocked === false) ? (<button onClick={() => AddFriend(visitor.user)}>Add Friend</button>
                ) : visitor.Already_send && (visitor.ImBloqued === false && visitor.isBlocked === false) ? (<div className='name' style={{ float: 'right' }}>Waiting</div>
                ) : visitor.ImBloqued === true || visitor.isBlocked === true ? (<></>
                ) : (<button onClick={() => InviteFriend(visitor.user)}>Invite Friend</button>
                )}
                {visitor.isBlocked === true ? (
                  <button onClick={() => DeblockUser(visitor.user)}>Deblock User</button>
                ) : (
                  visitor.ImBloqued === false ? (<button onClick={() => BlockUser(visitor.user)}>Block User</button>) : (<></>))}
              </div>
            </div>
            <div className="first-box">
              <div className="image-container">
                {achievements.map((achievement) => (
                  <img
                    key={achievement.id}
                    src={achievement.imgUrl}
                    alt={`Achievement ${achievement.id}`}
                    className={achievement.unlocked ? 'unlocked' : 'locked'}
                    title={achievement.text}
                  />
                ))}
              </div>
            </div>
            <div className='first-box' style={{ maxHeight: "400px", overflow: "auto" }}>
              <p>match history</p>
              <ul>
                {matchHistory && matchHistory.map((history) => (
                  <li key={history.id}>
                    {history.win === true ? (
                      <p style={{ color: "green" }}>Won against {history.opponent_nickname} : {history.my_score} - {history.opponent_score}</p>
                    ) : (
                      <p style={{ color: "red" }}>Lost against {history.opponent_nickname} : {history.my_score} - {history.opponent_score}</p>)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>)
      }
      {!wait}
      {wait && !visitor && (<NoPage />)}
    </div>
  );
}

export default Profil;
