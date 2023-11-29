import './Profil.css'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Friends from '../friends/Friends';
import Header from '../Header';
import GotBeatenUp from './GotBeatenUp.png';
import PongLooser from './PongLooser.png';
import MyFirstWin from './MyFirstWin.png';
import PongLover from './PongLover.png';
import PongMaster from './PongMaster.png';
import "../sharedTypes"


function MyProfil(): JSX.Element {
    const [showFriends, setshowFriends] = useState(false);
    const [showInviteFriend, setshowInviteFriend] = useState(false);
    const [friends, setFriends] = useState([]);
    const [inviteReceived, setinviteReceived] = useState([]);
    const nickname = localStorage.getItem("userName");
    const avatar = localStorage.getItem('avatar')!;
    const navigate = useNavigate();

    const initialAchievements = [
        { id: 1, imgUrl: GotBeatenUp, unlocked: false, text: "Got Beaten Up" },
        { id: 2, imgUrl: PongLooser, unlocked: false, text: "Pong Looser" },
        { id: 3, imgUrl: MyFirstWin, unlocked: false, text: "My First Win" },
        { id: 4, imgUrl: PongLover, unlocked: false, text: "Pong Lover" },
        { id: 5, imgUrl: PongMaster, unlocked: false, text: "Pong Master" },
    ];

    const [achievements, setAchievements] = useState(initialAchievements);

    const GetAll = async () => {
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
          

                navigate('/');
                }
                
                if (data.data) {
                    const friendsData = data.data.filter((user) => user.isFriend === true);
                    const invitedData = data.data.filter((user) => user.Already_invite === true);
                    setFriends(friendsData);
                    setinviteReceived(invitedData);
                }
            })
    }

    const [matchHistory, setMatchHistory] = useState([]);
    const [achivementString, setAchievementString] = useState("");
    const [rank, setRank] = useState(0);

    const handleShowFriends = ():void => {
        GetAll();
        setshowFriends(true);
    };

    const handleShowInviteFriends = ():void => {
        GetAll();
        setshowInviteFriend(true);
    };

    useEffect(() => {
        const URL = "http://" + window.location.hostname + ":4000";
        const final = URL + "/users";
        fetch(final, {
            credentials: 'include',
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({nickname : nickname}),
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if(data.message === "ExpiredToken by me")
                {
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
    }, [achivementString, achievements, nickname, rank, matchHistory, navigate]);

    return (
        <div>
            <Header />
            <div className='box'>
                <div className='first-box'>
                    <div className="info">
                        <img src={avatar} alt="avatar" style={{ float: 'left' }} />
                        <div className='name' style={{ float: 'left' }}>{nickname}</div>
                        <div className='name' style={{ float: 'right' }}>Points : {rank}</div>
                    </div>
                    <div className="showFriends">
                        <div className="clickable-text" onClick={handleShowFriends}>Friends list &#x25BE; </div>
                        <br />
                        <div className="clickable-text" onClick={handleShowInviteFriends}>Invite Friend list &#x25BE; </div>
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
                        {matchHistory.map((history:ft_MatchHistory) => (
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
            <Friends onClose={() => setshowFriends(false)} show={showFriends} friends={friends} title={"List of friends"}></Friends>
            <Friends onClose={() => setshowInviteFriend(false)} show={showInviteFriend} friends={inviteReceived} title={"List of invitations received"}></Friends>
        </div>
    );
}

export default MyProfil;