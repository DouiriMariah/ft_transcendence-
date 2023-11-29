import React, { useEffect, useState } from "react";
import './w3school.css'
import Header from '../Header';
import CreateConv from "./CreateConv";
import CreateConvRoom from "./CreateConvRoom";
import { useSocket } from '../SocketContext';
import { useNavigate } from 'react-router-dom';
import '../sharedTypes';
import privateImg from './private.png';
import protectedImg from './protected.png';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import Lock from './cadenas-ouvert.png';

const BeginChat: React.FC = (): JSX.Element => {
  const socket = useSocket();
  const [me, setUser] = useState<ft_Session>();
  const [list, setList] = useState<ft_Session[]>();
  const [room, SetNewRoom] = useState('');
  const [type_chan, SetTypeChan] = useState('');
  const [activeTab, setActiveTab] = useState<ft_User>();
  const [dm, setActualDm] = useState<ft_Chat>();
  const [selectedChannel, SelectChannel] = useState<ft_Chat>();
  const [msg, setMsg] = useState('');
  const [showModal, setshowModal] = useState(false);
  const [creatChatModal, setShowModalCreateChat] = useState(false);
  const [channelsList, setChannelsList] = useState<ft_Chat[]>();
  const [profile, setProfileSelected] = useState<ft_Session>();
  const [password, SetPwd] = useState('');
  const [verif, SetVerif] = useState('');
  const [modif, SetModif] = useState('');
  const [checked_pwd, SetChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [montre, SetMontre] = useState(true);
  const [banned, setBanned] = useState(false);
  const [block, setBlock] = useState<ft_BlockedUser[]>();
  const [stalk, setStalk] = useState<ft_BlockedUser[]>();
  const [activeChan, setActiveChan] = useState<ft_Chat>();
  const [chat, setActualChan] = useState<ft_Chat>();
  const [chan, setChanMsg] = useState<ft_Chat>();
  const [priv, SetPrivate] = useState(true);
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<{ user: string, channelId: number }[]>([]);

  const addInvitation = (user: string, channelId: number) => {
    const indexToRemove = invitations.findIndex(
      (invitation) => invitation.user === user && invitation.channelId === channelId
    );

    if (indexToRemove === -1) {
      setInvitations([...invitations, { user, channelId }]);
    }
  };

  const removeInvitation = (user: string, channelId: number) => {
    const indexToRemove = invitations.findIndex(
      (invitation) => invitation.user === user && invitation.channelId === channelId
    );

    if (indexToRemove !== -1) {
      const newInvitations = [...invitations];
      newInvitations.splice(indexToRemove, 1);
      setInvitations(newInvitations);
    }
  };

  const NewUserInChat = (user: string, channelId: number, action: string) => {
    if (action === 'add') {
      socket.emit("Add_inv", { channel: channelId, add_user: user });
    }
    else {
      socket.emit("Refuse_inv", { channel: channelId, refuse_user: user });
    }
    removeInvitation(user, channelId);
  }

  const handleSendMessage = (type: string, message: string, to: string, to_username: string) => {
    if (to === to_username)
      type = "channel";
    if (type === 'pv') {
      socket.emit('private message', {
        content: message,
        to: to,
        to_username: to_username,
      });
    } else {
      socket.emit('group_chat', {
        rooms_name: to,
        content: message,
      });
    }
    setMsg('');
  };

  const username = localStorage.getItem('userName');
  if (username) {
    socket.auth = { username };
    socket.connect();
    socket.emit("Muted_list")
    if(!list)
    {
      socket.emit("co2");
      socket.emit("update-sessions");
      socket.emit('my-info');
      socket.emit("channels")
    }
  }

  useEffect(():()=> void => {
    socket.on('session', (item:{user_info:ft_Session; block:ft_BlockedUser[]; stalk:ft_BlockedUser[]}) => {
      setUser(item.user_info);
      setBlock(item.block);
      setStalk(item.stalk);
    });

    socket.on('users', (users: ft_Session[]) => {
      setList(users);
      if (activeTab) {
        const active: ft_Session | undefined = users.find((element: ft_Session) => element.userId === activeTab.id.toString())
        if (active) {
          setActiveTab({ id: active.userId, username: active.username, status: active.connected, avatar: active.user.avatar })
        }
      }
    });

    socket.on('rooms_list', (channelsList: ft_Chat[]) => {
      UpdateSelectedChannel(channelsList);
      setChannelsList(channelsList);
    });

    socket.on('private message', (message: string) => {
      let updatedChat: any;
      if (dm && dm.message) {
        updatedChat = {
          ...dm,
          message: [...dm.message, message],
        };
      }
      else {
        updatedChat = {
          ...dm,
          message: [message],
        };
      }
      setActualDm(updatedChat);
    })

    socket.on("InChat", (channel: number) => {
      if (activeChan && activeChan.id === channel) {
        SetPrivate(false);
      }
    })

    socket.on("priv_inv", (info: { add_user: string; chat_id: number }) => {
      addInvitation(info.add_user, info.chat_id);
    })

    socket.on("inv_accepted", (channel: number) => {
      if (activeChan && channel === activeChan.id) {
        SetPrivate(true);
        socket.emit("findChan", channel);
      }
    })

    socket.on("inv_refused", (channel: number) => {
      if (activeChan && channel === activeChan.id) {
        SetPrivate(false);
      }
    })

    socket.on("ActualDm", (chat: ft_Chat): void => {
      setActualDm(chat);
    })

    socket.on("ActualChan", (chati: ft_Chat): void => {
      if (activeChan && activeChan.id === chati.id) {
        setChanMsg(chati);
        setActualChan(chati);
        SetPrivate(true);
      }
    })

    socket.on('modif', (chati: ft_Chat): void => {
      if (activeChan && activeChan.chat_name === chati.chat_name) {
        setChanMsg(chati);
        setActualChan(chati);
        socket.emit("BannedOne", chati.id);
      }
    })

    socket.on('kicked', (chati: ft_Chat): void => {
      if (activeChan && chati.id === activeChan.id) {
        setChanMsg(undefined);
        setActualChan(undefined);
        socket.emit("LeaveChat", chati);
      }
    })

    socket.on("clean", (chat_name: string): void => {
      if (activeChan && activeChan.chat_name === chat_name) {
        setChanMsg(undefined);
        setActualChan(undefined);
        if (activeChan.type === "channel_private") {
          SetPrivate(false);
        }
        if(activeChan.protected)
        {
          SetMontre(false);
        }
      }
    })

    socket.on("IsProtected", (test: { test: boolean; chan: number }): void => {
      if (activeChan && (activeChan.id === test.chan)) {
        if (test.test) {
          SetMontre(true);
        } else {
          SetMontre(false);
        }
      }
    })

    socket.on("blocklist", (item: { block: ft_BlockedUser[]; stalk: ft_BlockedUser[] }): void => {
      setBlock(item.block);
      setStalk(item.stalk);
    });

    socket.on('messageFromRoom', (message: ft_Message): void => {
    });

    socket.on('group_chat', (message: ft_Message): void => {
      let updatedChat: any;
      if (activeChan && message.name_chat === activeChan.chat_name) {
        if (chan && chan.message) {
          updatedChat = {
            ...chan,
            message: [...chan.message, message],
          };
        }
        else {
          updatedChat = {
            ...chan,
            message: [message],
          };
        }
        setChanMsg(updatedChat);
      }
    });

    socket.on('user disconnected', (userId: string) => {
      if (list) {
        const tmp = list.find((user) => user.userId === userId);
        if (tmp)
          tmp.connected = "offline";
      }
    });

    socket.on('ImBanned', (rep: ft_Chat): void => {
      if (rep.rep) {
        setBanned(true);
        if (activeChan && activeChan.id === rep.id) {
          setActualChan(undefined);
          setChanMsg(undefined);
        }
        socket.emit("LeaveChat", rep);
      }
      else {
        setBanned(false);
      }
    })

    return (): void => {
      socket.off("block");
      socket.off('user disconnected');
      socket.off('ActualDm')
      socket.off('session');
      socket.off('private message');
      socket.off('users');
      socket.off('rooms_list');
      socket.off('messageFromRoom');
      socket.off('IsProtected');
      socket.off('ImBanned');
      socket.off('kicked');
      socket.off('group_chat');
      socket.off('modif');
      socket.off("clean");
      socket.off('inv_refused');
      socket.off('inv_accepted');
      socket.off('priv_inv');
      socket.off('InChat');
    };
  });

  const Join_rooms = (): void => {
    setShowModalCreateChat(false);
    if (room) {
      let typi = "public";
      if (type_chan) {
        typi = "private";
    }
      if (RoomExist(room, "same") && RoomExist(room, "invalid") && RoomExist(room, "toolong")) {
        socket.emit('create_channel', { chat_name: room, password: password, type: typi });
      }
    }
    SetTypeChan('');
    SetNewRoom('');
    SetPwd('');
    SetChecked(false);
    setShowPassword(false);
  };

  const LeaveChat = (channel: ft_Chat): void => {
    socket.emit("LeaveChat", channel);
  }

  const BlockUser = (to_block: string): void => {
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

  const ShowProfile = (see_user: string): void => {
    if (localStorage.getItem('userName') === see_user)
      navigate("/profile");
    else
      navigate("/profile/" + see_user);
  }

  const InviteFriend = (name: string): void => {
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/users/invitefriend";
    fetch(final, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: name }),
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

  const ModifyPassword = (pwd: string, action: string, chan: string) => {
    socket.emit("change-password", {
      chan,
      pwd,
      action,
    })
    SetVerif('');
    SetModif('');
  }

  const CanWeTalk = (username: string): true | JSX.Element | undefined => {
    if (!StalkerUser(username) && !BlockedUser(username)) {
      return true;
    } else if (StalkerUser(username)) {
      return (<p>You are a stalker, move out</p>)
    } else if (BlockedUser(username)) {
      return (<p>You have blocked {username}</p>)
    }
  }

  const NewConv = (user_name: ft_Session | undefined): void => {
    if (user_name) {
      setshowModal(true);
      setProfileSelected(user_name);
    } else {
      setShowModalCreateChat(true);
    }
  }

  const InviteGame = (opponent: string): void => {
    setshowModal(false);
    socket.emit("InviteToGame", { opponent: opponent });
    // toast("Invitation Pong sent")
  }


  const BeAdmin = (username: string, channel: ft_Chat, adminstatus: string): void => {
    if (adminstatus !== "Non admin") {
      socket.emit("Admin", { new_admin: username, chat: channel });
    }
  }

  const DeblockUser = (name: string): void => {
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

  const BlockedUser = (username: string): boolean | undefined => {
    if (block)
      return block.some((admin: { blockerId: string }) => admin.blockerId === username) ? true : false;
  }

  const StalkerUser = (username: string): boolean | undefined => {
    if (stalk)
      return stalk.some((admin: { userId: string }) => admin.userId === username) ? true : false;
  }

  const AdminRights = (username: ft_Session, channel: ft_Chat, action: string): void => {
    if (me && getAdminStatus(me.username, channel) !== "") {
      if (username.username === channel.owner_group_chat) {
        return;
      }
      if (action === "MuteUser") {
        socket.emit("Mute", { user_muted: username.username, chat: channel });
        // toast("Muted!");
      }
      else if (action === "BanUser") {
        socket.emit("Ban", { user_banned: username.username, chat: channel });
      }
      else if (action === "KickUser") {
        socket.emit("Kick", { user_kicked: username.username, chat: channel });
        // toast("Kicked!");
      }
      else if (action === "UnbanUser") {
        socket.emit("Unban", { user_banned: username.username, chat: channel });
        // toast("Unbanned!");
      }
      else if (action === "UnMuteUser") {
        // toast("Unmuted!");
        socket.emit("UnMute", { user_muted: username.username, chat: channel });
      }
    }
  }

  const EnterPassword = (pwd: string): void => {
    socket.emit("protected_channel", {
      mdp: pwd,
      channel: activeChan,
    });
    SetVerif('');
    SetModif('');
  }

  const UpdateSelectedChannel = (channelsList: ft_Chat[]) => {
    if (selectedChannel) {
      const update = channelsList.find((admin: { chat_name: string }) => admin.chat_name === selectedChannel.chat_name);
      if (update) {
        // SetDisplay(update);
        if (!update.protected) {
          SetMontre(true);
        } else {
          SetMontre(false);
        }
      }
    }
  }

  // const PrivateChannel = (channel) => {
  //   if(!montre)
  //   {
  //     socket.emit("Private", channel.id);
  //   }
  // }

  const getBannedStatus = (username: string, channel: ft_Chat): boolean | undefined => {
    if (me && username === me.username) {
      socket.emit("BannedOne", channel.id);
    }
    else
      return channel.banned.some((admin) => admin.username === username) ? true : false;
  }

  const getAdminStatus = (username: string, channel: ft_Chat) => {
    if (username === channel.owner_group_chat) {
      return " (Owner) ";
    }
    return channel.admins.some((admin) => admin.username === username) ? " (Admin) " : "";
  };

  const getMutedStatus = (username: string, channel: ft_Chat) => {
    return channel.muted.some((admin) => admin.username === username) ? " (Muted) " : "Non muted";
  };

  const ConvSelected = (channel: ft_Chat | undefined, dm: ft_Session | undefined) => {
    if (channel) {
      setActualDm(undefined);
      setActiveChan(channel);
      if (channel.type === "channel_private" && channel.owner_group_chat !== username) {
        SetPrivate(false);
      }
      else
      {
        SetPrivate(true);
      }
      setActiveTab(undefined);
      setChanMsg(undefined);
      setActualChan(undefined);
      if (channel.protected) {
        SetMontre(false);
      } else {
        SetMontre(true);
      }
      socket.emit("findChan", channel.id);
    } else if (dm) {
      // activeChan('');
      setActiveChan(undefined);
      setActualChan(undefined);
      setChanMsg(undefined);
      SelectChannel(undefined);
      SetPrivate(true);
      // SetDisplay(null);
      socket.emit("findDm", dm.username);
      setActiveTab({ id: dm.userId, username: dm.username, status: dm.connected, avatar: dm.user.avatar });
    } else {
      setActiveTab(undefined);
      setActualChan(undefined);
      setChanMsg(undefined);
      SetPrivate(false);
      setActualDm(undefined)
      // SelectChannel(null);
      // SetDisplay(null);
    }
  }

  const handleCheckboxChange = (): void => {
    SetChecked(!checked_pwd)
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    SetPwd(event.target.value);
  };

  const handleTogglePassword = (): void => {
    setShowPassword(!showPassword);
  };

  const RoomExist = (name: string, action: string): boolean | undefined => {
    if (channelsList && action === "same") {
      const check = channelsList.find((admin) => admin.chat_name === name);
      if (check)
        return false;
      else
        return true;
    }
    else if (action === "invalid") {
      const alphanumericPattern = /^[a-zA-Z0-9]+$/;
      const isValidNickname = alphanumericPattern.test(name);
      if (!isValidNickname)
        return false
      return true;
    }
    else if (action === "toolong")
    {
      if (name.length > 10)
        return false;
      return true;
    }
  }

  return (
    <div className="bodo">
      <Header />
      <div className="containo">
        <div className="small-div">
          <div className="newconv">
            <div className="custom_btn" onClick={() => NewConv(undefined)}>+</div>
            <CreateConvRoom onClose={() =>  setShowModalCreateChat(false)} show={creatChatModal} title="New Chat">
              <div className="create_chat">
                <input 
                  id="text_id"
                  name="text_name"
                  type="text"
                  placeholder="Name of the group"
                  value={room}
                  onChange={e => SetNewRoom(e.target.value)}
                />
                <label htmlFor="text_id"></label>

                {room && !RoomExist(room, "same") && (
                  <div>
                    This chat name is already in use
                  </div>
                )}
                {room && !RoomExist(room, "invalid") && (
                  <div>
                    This chat name is invalid
                  </div>
                )}
                {room && !RoomExist(room, "toolong") && (
                  <div>
                    This chat name is too long
                  </div>
                )}
              </div>
              <br />
              <h3 style={{ backgroundColor: "inherit", margin: "10px" }}>Private</h3>
              <input
                name="checkbox_name"
                id="checkbox_id"
                type="checkbox"
                placeholder="private"
                value="true"
                onChange={e => SetTypeChan(e.target.value)}
              />
                <label htmlFor="checkbox_id"></label>
              <br />
              <div className="create_chat">
                <h5 style={{ backgroundColor: "inherit", margin: "10px" }}> Protected Chat : </h5>
                <label className="toggle-button">
                  <input
                    name="checkbox_name2"
                    id="checkbox_id2" 
                    type="checkbox"
                    checked={checked_pwd}
                    // onChange={e => handleCheckboxChange(e.target.value)}
                    onChange={e => handleCheckboxChange()}
                  />
                <label htmlFor="checkbox_id2"></label>
                  <span className="slider"></span>
                </label>
                {checked_pwd && (
                  <div className="create_chat">
                    <input 
                      name="passwordInput_name"
                      className="input_chat"
                      type={showPassword ? 'text' : 'password'}
                      id="passwordInput"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => handlePasswordChange(e)}
                    />
                <label htmlFor="passwordInput"></label>
                    <span>
                      <button className="create_button" onClick={() => handleTogglePassword()} >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </span>
                    <br/>
                  </div>
                )}
                  <br/>
                  <br/>
                  <button onClick={() => Join_rooms()}>
                  DONE
                </button>
              </div>
            </CreateConvRoom>
          </div>
        </div>
        <div className="small-div-r">
          {activeTab && (
            <div className="new_who">
              <div className="avatar-container">
                <span className={`dot ${activeTab.status === "offline" ? 'offline' : (activeTab.status === 'online' ? "online" : "ingame")}`}></span>
                <img src={activeTab.avatar} alt="Avatar" />
              </div>
              <p>{activeTab.username}</p>
            </div>
          )}
          {activeChan && (
            <div className="new_who">
              {activeChan.chat_name}
            </div>
          )}
        </div>
        <div className="small-divi"> <div className="msg_pv" style={{ color: "white", fontSize: "30px", bottom : "0px" }}>Members</div> </div>
      </div>
      <div className="last-divs-container">
        <div className="last-div">
          <h2 style={{ color: "wheat" }}>DM</h2>
          <div className="tab">
            <ul>
              {list && list.map((user) => (
                user.username !== username && (
                  <li key={user.userId}>
                    <button
                      id="button_id"
                      name="button_name"
                      className={activeTab && activeTab.username === user.username ? 'tablinks active' : 'tablinks'}
                      onClick={() => ConvSelected(undefined, user)}
                    >
                      <div className="avatar-container">
                        <img src={user.user.avatar} alt="Avatar" />
                        <span className={`dot ${user.connected === "offline" ? 'offline' : (user.connected === 'online' ? "online" : "ingame")}`}></span>
                      </div>
                      <div className="username">{user.username}</div>
                    </button>
                  </li>
                )))}
            </ul>
          </div>
          <h2 style={{ color: "wheat" }}>CHANNELS</h2>
          <div className="tab">
            <ul>
              {channelsList && channelsList.map((channel: ft_Chat, index: number) => (
                <li key={index}>
                  <button
                    className={activeChan === channel ? 'tablinks active' : 'tablinks'}
                    onClick={() => ConvSelected(channel, undefined)}
                  >
                    <div className="username">#{channel.chat_name}<span className="protectedBool"></span></div>
                    {channel.protected && <img src={protectedImg} alt="protectedimage" style={{height:"30px", width:"30px"}} />}
                    {channel.type === "channel_private" && <img src={privateImg} alt="privateimage" style={{height:"30px", width:"30px"}}/>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="last-div-r">
          {activeTab && CanWeTalk(activeTab.username) === true && (
            <div className="div-r-sup">
              <div className="div-r-sup">
                {dm && dm.message && dm.message.map((message, index) => (
                  <div key={index} className="div-r-sup">
                    {message.from === username ? (
                      <>
                        <p className="sender__name">You</p>
                        <div className="message__sender">
                          {message.content}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="receiver__name">{message.from}</p>
                        <div className="message__recipient">
                          {message.content}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab && CanWeTalk(activeTab.username)}
          {activeTab && !StalkerUser(activeTab.username) && !BlockedUser(activeTab.username) && (
            <div className="nested-container">
              {/* <div className="chat_bar" style={{ position: "fixed", flexWrap: "nowrap" }}> */}
              <input 
                name="foot_name"
                id="foot_id"
                className="foot"
                type="text"
                placeholder="Type msg"
                value={msg}
                onChange={e => setMsg(e.target.value)}
              />
              <button className="nested-button" onClick={() => handleSendMessage("pv", msg, activeTab.id.toString(), activeTab.username)}>
                Send
              </button>
            </div>
            // </div>
          )}
          {activeChan && me && ((chat && activeChan.id === chat.id && getBannedStatus(me.username, chat)) || banned) && (
            <p>You are banned from {activeChan.chat_name}</p>
          )}
          {activeChan && activeChan.protected && !montre && !banned &&
            (
              <div className="create_chat">
                <label>Please enter the password of this channel
                  <input
                    className="input_chat"
                    type="password"
                    placeholder="Enter the channel password"
                    value={verif}
                    onChange={(e) => SetVerif(e.target.value)}
                  />
                </label>
                <button style={{ color: "white" }} onClick={() => EnterPassword(verif)}>Submit</button>
              </div>
            )}
          {activeChan && (activeChan.type === "channel_private") && chat?.owner_group_chat === username && !chat && !priv && !banned && (
            <span className="private_message">
              [Private Channel]<br /> Type a message to be accepted. 
            </span>
          )
          }
          {me && activeChan && chat && chat.id === activeChan.id && (!getBannedStatus(me.username, chat) || !banned)
            && montre &&
            (
              <div className="div-r-sup">
                {chan && chan.message && chan.message.map((message, index) => (
                  <div key={index} className="div-r-sup">
                    {message.from === username ? (
                      <>
                        <p className="sender__name">You</p>
                        <div className="message__sender">
                          {message.content}
                        </div>
                      </>
                    ) : (
                      <>
                        {!StalkerUser(message.from) && !BlockedUser(message.from) && (
                          <>
                            <p className="receiver__name">{message.from}</p>
                            <div className="message__recipient">
                              {message.content}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          {activeChan
            && montre && !priv &&(
              <div className="nested-container">
                <input className="foot"
                  type="text"
                  placeholder="[Private chat] Type anything to be invited"
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                />
                <button className="nested-button" onClick={() => handleSendMessage("channel", msg, activeChan.chat_name, activeChan.chat_name)}>
                  Send
                </button>
              </div>)}
              {activeChan
            && montre && priv && (
              <div className="nested-container">
                <input className="foot"
                  type="text"
                  placeholder="Type msg"
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                />
                <button className="nested-button" onClick={() => handleSendMessage("channel", msg, activeChan.chat_name, activeChan.chat_name)}>
                  Send
                </button>
              </div>)}

        </div>
        <div className="last-divi">
          {/* <div className="msg_pv" style={{ color: "white", fontSize: "30px" }}>Members</div><br /> */}
          <div className="tabi">
            {activeChan && chat && chat.id === activeChan.id && (
              <div>
                <ul>
                  {chat.users.map((user, index) =>
                  (
                    <div key={index}>
                      <button onClick={() => NewConv(user)}>
                        {username === user.username ? "Me" : user.username}
                        {/* <span> */}{" "}
                        {getAdminStatus(user.username, chat)}
                        {/* </span> */}
                        {/* <span> */}{" "}
                        {/* {getMutedStatus(user.username, chat)} */}
                        {/* </span> */}
                      </button>
                    </div>
                  ))}
                  <div className="msg_pv">
                    Banned
                    {chat.banned.map((user, index) =>
                      user.username !== username && (
                        <div key={index}>
                          <button onClick={() => NewConv(user)}>
                            {user.username}
                          </button>
                        </div>
                      ))}
                  </div>
                  <CreateConv onClose={() => setshowModal(false)} show={showModal} title={profile && profile.username}>
                    <button onClick={() => profile && ShowProfile(profile.username)}>Profile</button>
                    {profile && profile.username !== username && (
                      <>
                        {CanWeTalk(profile.username) === true && (
                          <>
                            <button onClick={() => InviteFriend(profile.username)}>Invite Friend</button>
                            {profile && profile.connected === "online" && (
                              <button onClick={() => InviteGame(profile.username)}>Invite Pong</button>
                            )}
                          </>
                        )}
                        {(me && (getAdminStatus(me.username, chat) !== "")) && (
                          <div>
                            <button onClick={() => BeAdmin(profile.username, chat, getAdminStatus(me.username, chat))}>New Admin</button>
                            <button onClick={() => AdminRights(profile, chat, "KickUser")}>Kick</button>
                            {(getMutedStatus(profile.username, chat) === "Non muted") ? (
                              <button onClick={() => AdminRights(profile, chat, "MuteUser")}>Mute</button>
                            ) : (
                              <button onClick={() => AdminRights(profile, chat, "UnMuteUser")}>UnMute</button>
                            )}
                            {!getBannedStatus(profile.username, chat) ? (
                              <button onClick={() => AdminRights(profile, chat, "BanUser")}>Ban</button>
                            ) : (
                              <button onClick={() => AdminRights(profile, chat, "UnbanUser")}>UnBan</button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </CreateConv>
                </ul>
              </div>
            )}
          </div>
          {activeChan && chat && chat.owner_group_chat === username && (
            <div>
              <h4 style={{ color: "white", marginTop: "250px" }}>Type your new password :</h4>
              <div className="new_pass">
                <input id="input_chat_id"
                  className="input_chat"
                  type="password"
                  placeholder="Modify channel password"
                  value={modif}
                  onChange={(e) => SetModif(e.target.value)}
                />
                <label htmlFor="input_chat_id"></label>
              </div>
              <div>
                  <>
                  <button className="newpassbutton" onClick={() => ModifyPassword(modif, "modify", activeChan.chat_name)}>Submit</button>
                  <button className="newpassbutton" onClick={() => ModifyPassword("", "", activeChan.chat_name)} > <img src={Lock} alt="lock" style={{height: "18px", backgroundColor: "wheat"}}/></button>
                  </>
              </div>
              <div className="invit">
                Invitations
                {invitations && invitations.map((user, index) =>
                  user.channelId === activeChan.id && (
                    <div key={index}>
                      <p>{user.user}</p>
                      <button onClick={() => NewUserInChat(user.user, activeChan.id, 'add')}> Add </button>
                      <button onClick={() => NewUserInChat(user.user, activeChan.id, 'no')}> Del </button>
                    </div>

                  ))}
              </div>
            </div>
          )}
          {activeChan && chat && chat.id === activeChan.id && (

            <div className="chat_bari">
              <button className="conv_btn" onClick={() => LeaveChat(chat)}>Leave</button>
            </div>
          )}
          {activeTab && (
            <div className="mini_profile">
              <div className="mini">
                <div className="avatar-container">
                  <span className={`dot ${activeTab.status === "offline" ? 'offline' : (activeTab.status === 'online' ? "online" : "ingame")}`}></span>
                  <img src={activeTab.avatar} alt="Avatar" />
                </div>
                <p>{activeTab.username}</p>
              </div>
              <div className="chat_bari">
                {activeTab && CanWeTalk(activeTab.username) === true ?
                  (
                    <div>
                      <button onClick={() => ShowProfile(activeTab.username)}>Show Profile</button>
                      <button onClick={() => InviteFriend(activeTab.username)}>Invite Friend</button>
                      {
                        activeTab.status === 'online' ?
                          <button onClick={() => InviteGame(activeTab.username)}>Invite Game</button> : <></>
                      }
                      <button className="conv_btn" onClick={() => BlockUser(activeTab.username)}>Block User</button>
                    </div>
                  )
                  : activeTab && BlockedUser(activeTab.username) ? (
                    <>
                      <button className="conv_btn" onClick={() => DeblockUser(activeTab.username)}>Deblock User</button>
                    </>
                  ) : <></>
                  // </div>
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BeginChat;