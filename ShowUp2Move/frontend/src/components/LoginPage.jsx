import { useState } from "react";
import { login } from "./services/authService";

const LoginPage = ({ setCurrentUserId }) => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    login(username, password)
      .then(user => {
        localStorage.setItem(
  "currentUserId",
  user.id
);

setCurrentUserId(user.id);
      })
      .catch(() => {
        setError("Wrong username or password");
      });
  };

  return (

  <div className="login-page">

    <div className="login-card">

      <h1 className="login-title">
        ShowUp2Move
      </h1>

      <p className="login-subtitle">
        Smart Sports Matching Platform
      </p>

      <input
        className="login-input"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) =>
          setUsername(e.target.value)
        }
      />

      <input
        className="login-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button
        className="login-btn"
        onClick={handleLogin}
      >
        Login
      </button>

      <p className="login-error">
        {error}
      </p>

    </div>

  </div>

);
};

export default LoginPage;