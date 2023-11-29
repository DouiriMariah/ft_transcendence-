import './Register.css'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import avatarimg from '../avatar_default.png';
import Header from '../Header';

function Register(): JSX.Element {
  if (!localStorage.getItem("userName")) {
    localStorage.setItem("connected", "no");
  }
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar"));
  if (!avatar) {
    setAvatar(avatarimg);
  }
  const [nicknameError, setNicknameError] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState('');
  const alphanumericPattern = /^[a-zA-Z0-9]+$/;
  const isValidNickname = alphanumericPattern.test(nickname);
  const navigate = useNavigate();

  const handleDone = ():void => {
  if (!nickname) {
      setNicknameError('Nickname cannot be empty.');
      return;
    }
    if (nickname.length > 20) {
      setNicknameError("Nickname too long");
      return ;
    }
    if (!isValidNickname) {
      setNicknameError("Nickname contains invalid characters");
      return;
    }
    if (!avatar) {
      setAvatarError("Missing avatar");
      return;
    }
    const maxFileSize = 100 * 1024;

    const blob = fetch(avatar).then(response => response.blob());

    blob.then((imageBlob):void => {
      if (imageBlob.size > maxFileSize) {
        setAvatar(avatarimg)
        setAvatarError('Image too heavy');
        return;
      }
    })
    const URL = "http://" + window.location.hostname + ":4000";
    const final = URL + "/auth/set-nickname";
    fetch(final, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nickname, avatar: avatar }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          setNicknameError("Nickname is already in use");
        }
      })
      .then((data) => {
        if(data.message === "ExpiredToken by me")
        {
        localStorage.setItem("connected", "no");
      

        navigate('/');
        }
        
        if (data.data) {
          localStorage.setItem("connected", "yes");
          localStorage.setItem("userName", nickname);
          localStorage.setItem("avatar", avatar);
          navigate('/home');
        }
        else {
          setNicknameError("Nickname is already in use");
        }
      })
  }
  const [isChecked, setIsChecked] = useState(localStorage.getItem("2AF") !== null);

  useEffect(() => {
    const handleLocalStorageChange = (e:StorageEvent):void => {//ATTENTION -> A TESTER
      if (e.key === "2AF") {
        setIsChecked(e.newValue !== null);
      }
    };
    window.addEventListener("storage", handleLocalStorageChange);
    return () => {
      window.removeEventListener("storage", handleLocalStorageChange);
    };
  }, []);

  useEffect(():void => {
    const storedNickname = localStorage.getItem('userName');
    if (storedNickname) {
      setNickname(storedNickname);
    }
    const storedAvatar = localStorage.getItem("avatar");
    if (storedAvatar) {
      setAvatar(storedAvatar);
    }
  }, []);


  const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>):void => {
    setNickname(event.target.value);
    setNicknameError('');
  };

  // const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>):void => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       const base64data = reader.result as string;
  //       setAvatar(base64data);
  //     };
  //     event.target.value = '';
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>):void => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setAvatar(base64data);
        };
        event.target.value = '';
        reader.readAsDataURL(file);
      } else {
        setAvatar(avatarimg);
        setAvatarError('Only .jpg and .png files are allowed.');
      }
    }
  };

  const handleToggle = ():void => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    if (newValue) {
      localStorage.setItem("2AF", "someValue");
      const URL = "http://" + window.location.hostname + ":4000";
      const final = URL + "/auth/ga2f";
      fetch(final, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
          }
        })
        .then((data) => {
          if(data.message === "ExpiredToken by me")
          {
          localStorage.setItem("connected", "no");
         
          navigate('/');
          }
          
          setQrCodeImageUrl(data.data);
        })
    } else {
      localStorage.removeItem("2AF");
      setQrCodeImageUrl('');
      const URL = "http://" + window.location.hostname + ":4000";
      const final = URL + "/auth/no-a2f";
      fetch(final, {
        credentials: 'include',
        method: 'DELETE',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
          }
        })
        .then((data) => {
          if(data.message === "ExpiredToken by me")
          {
          localStorage.setItem("connected", "no");
        
          navigate('/');
          }
        })
    }
  };

  return (
    <div className='user-form-container'>
      {window.location.pathname === "/options" && <Header/>}
      <div className="form" style={{ backgroundColor: "aliceblue" }}>
        <label>Nickname:</label>
        <input type="text" value={nickname} onChange={handleNicknameChange} />
        {nicknameError && <div className="error-message">{nicknameError}</div>}
        <label>Avatar:</label>
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
        <img src={avatar!} alt="Avatar" className="avatar-preview" />
        {avatarError && <div className='error-message'>{avatarError}</div>}
        <div style={{ backgroundColor: "aliceblue" }}>
          <label>2AF?</label>
          <br />
          <label className="sliding-button">
            <input type="checkbox" checked={isChecked} onChange={handleToggle} />
            <span className="slider round"></span>
          </label>
        </div>
        <button onClick={handleDone}>Done</button>
        <br />
      </div>
      {qrCodeImageUrl && (
        <div className="qrcode" style={{ backgroundImage: `url(${qrCodeImageUrl})` }} />
      )}
    </div>
  );
};

export default Register;
