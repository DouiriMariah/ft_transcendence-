import './Friends.css'
import React from "react";
import { CSSTransition } from "react-transition-group";
import { useNavigate } from 'react-router-dom';
import '../chat/w3school.css';
import '../sharedTypes';

interface FriendsProps {
  show: boolean;
  title: string;
  friends: ft_User[]|undefined;
  onClose: () => void;
}

const Friends: React.FC<FriendsProps> = (props) => {
  const navigate = useNavigate();

  const handleProfileClick = (friend:ft_User) => {
    navigate(`/profile/${friend.user}`);
  };

  const AddFriend = (name: string) => {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/users/friends";
    fetch(final, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({friendName : name}),
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
      });
  };

  const InviteFriend = (name: string):void => {
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
        if(data.message === "ExpiredToken by me")
        {
        localStorage.setItem("connected", "no");
        socket.disconnect();

        navigate('/');
        }
      });
  };

  const DeleteFriend = (name: string):void => {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/users/deletefriend";
    fetch(final, {
      credentials: 'include',
      method: 'DELETE',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({byefriend : name}),
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
      });
  };

  return (
    <div>
      <CSSTransition
        in={props.show}
        unmountOnExit
        timeout={{ enter: 0, exit: 300 }}
      >
        <div className="friends" onClick={props.onClose}>
          <div className="friends-content">
            <div className='friends-title'>{props.title}</div>
            <ul className="friend-list">
              {props.friends && props.friends.map((friend) => (
                <li key={friend.user} className="friend-item">
                  <div className="friend-content">
                    <div className="avatar-container">
                      <img src={friend.avatar} alt={`Avatar of ${friend.user}`} className="avatar" />
                      <span className={`dot ${friend.status === "offline" ? 'offline' : (friend.status === 'online' ? "online" : "ingame")}`}></span>
                    </div>
                    <div className="nickname" >
                      <p onClick={() => handleProfileClick(friend)}>{friend.user}</p>
                    </div>
                  </div>
                  <div className="button-group" style={{ float: "right" }}>
                    {friend.isFriend ? (
                      <button className='buttonA' onClick={() => DeleteFriend(friend.user)}>Remove Friend</button>
                    ) : friend.Already_invite ? (
                      <button className='buttonA' onClick={() => AddFriend(friend.user)}>Accept Invitation</button>
                    ) : friend.Already_send ? (
                      <p style={{ backgroundColor: "wheat", color: "black" }}>Waiting</p>
                    ) : (
                      <button className="buttonA" onClick={() => InviteFriend(friend.user)}>Invite friend</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CSSTransition>
    </div>
  );
};

export default Friends;