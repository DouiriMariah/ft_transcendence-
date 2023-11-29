import React from 'react';
import './index.css';
import logo from './42_Logo.svg.png';


function Login():JSX.Element {
    const handleButtonLogin = () => {
        const URL = window.location.hostname;
        localStorage.setItem("connected", "yes");
        window.location.href = "http://" + URL + ":4000/auth/42";
    }

    return (
        <div>
            <button className="login" onClick={handleButtonLogin}>
                <img className="button-icon" src={logo.toString()} alt="Logo" style={{ background: "black" }} />
                <span className="button-text" style={{ background: "black" }}>LOGIN</span>
            </button>
        </div>
    );
}

export default Login
