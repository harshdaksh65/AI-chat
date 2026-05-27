import React, { useEffect, useState } from "react";
import "./NewChatModal.css";

const NewChatModal = ({ open, onClose, onCreate }) => {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onCreate(title);
  };

  if (!open) return null;

  return (
    <div className="new-chat-modal-backdrop" onClick={onClose} role="presentation">
      <section
        className="new-chat-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-chat-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="new-chat-modal-header">
          <h2 id="new-chat-modal-title">Create new chat</h2>
          <button
            type="button"
            className="new-chat-modal-close"
            onClick={onClose}
            aria-label="Close create chat dialog"
          >
            ×
          </button>
        </div>

        <form className="new-chat-modal-body" onSubmit={handleSubmit}>
          <label className="new-chat-modal-label" htmlFor="new-chat-title">
            Chat title
          </label>
          <input
            id="new-chat-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter chat title"
            autoComplete="off"
            autoFocus
          />

          <div className="new-chat-modal-actions">
            <button type="button" className="new-chat-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="new-chat-modal-create" disabled={!title.trim()}>
              Create chat
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default NewChatModal;