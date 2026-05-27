import React from "react";
import "./ChatSidebar.css";

const ChatSidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onLogout,
  onLogin,
  open,
  isLoggedIn,
}) => {
  return (
    <aside
      className={"chat-sidebar " + (open ? "open" : "")}
      aria-label="Previous chats">
      <div className="sidebar-header">
        <h2>AI chat</h2>
        <button className="small-btn" type="button" onClick={onNewChat}>
          New
        </button>
      </div>
      <nav className="chat-list" aria-live="polite">
        {chats.map((c) => (
          (() => {
            const chatId = c._id || c.id;

            return (
          <button
            key={chatId}
            className={
              "chat-list-item " + (chatId === activeChatId ? "active" : "")
            }
            type="button"
            onClick={() => onSelectChat(chatId)}>
            <span className="title-line">{c.title}</span>
          </button>
            );
          })()
        ))}
        {chats.length === 0 && <p className="empty-hint">No chats yet.</p>}
      </nav>
      <div className="sidebar-footer">
        {isLoggedIn ? (
          <button className="small-btn" type="button" onClick={onLogout}>
            Logout
          </button>
        ) : (
          <button className="small-btn" type="button" onClick={onLogin}>
            Login
          </button>
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;
