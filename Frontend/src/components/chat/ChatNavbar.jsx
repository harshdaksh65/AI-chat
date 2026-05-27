import React from "react";
import { useNavigate } from "react-router-dom";
import "./ChatNavbar.css";

const ChatNavbar = ({ title, onBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
      return;
    }

    navigate("/");
  };

  return (
    <header className="chat-navbar" role="banner">
      <div className="chat-navbar-inner">
        <button
          type="button"
          className="chat-navbar-back"
          onClick={handleBack}
          aria-label="Go back to home"
        >
          ←
        </button>
        <div className="chat-navbar-copy">
          <div className="chat-navbar-label">Current chat</div>
          <h1 className="chat-navbar-title">{title || "AI chat"}</h1>
        </div>
      </div>
    </header>
  );
};

export default ChatNavbar;
