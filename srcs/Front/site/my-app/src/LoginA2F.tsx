import React from 'react';
import './index.css';
import VerificationInput from "react-verification-input";
import { useNavigate } from 'react-router-dom';
import "./sharedTypes";

function LoginA2F() :JSX.Element{
  const navigate = useNavigate();
  localStorage.setItem("connected", "no");
    const handleVerificationCode = (code:string) => {
        const URL = "http://" + window.location.hostname + ":4000";
        const final = URL + "/auth/log-a2f";
        fetch(final, {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify({ otp: code }),
        })
            .then((response) => response.json())
            .then((data) => {
                if(data.message === "ExpiredToken by me")
                {
                //   console.log("pas de cookies les gars");
                  localStorage.setItem("connected", "no");
                    socket.disconnect();

                  navigate('/');
                }
                if (data.data) {
                    // console.log(data);
                    localStorage.setItem("connected", "yes");
                    const URL = "http://" + window.location.hostname + ":8000";
                    const final = URL + "/home";
                    window.location.href = final;
                    return;
                } else {
                    localStorage.setItem("connected", "no");
                }
            })
    };

    return (
        <div>
            <div className="verifinput">
                <VerificationInput length={6} validChars="0-9" onComplete={handleVerificationCode} />
            </div>
        </div>
    );
}

export default LoginA2F;
