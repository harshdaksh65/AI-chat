import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import ChatMobileBar from "../components/chat/ChatMobileBar.jsx";
import ChatSidebar from "../components/chat/ChatSidebar.jsx";
import ChatMessages from "../components/chat/ChatMessages.jsx";
import ChatComposer from "../components/chat/ChatComposer.jsx";
import ChatNavbar from "../components/chat/ChatNavbar.jsx";
import NewChatModal from "../components/chat/NewChatModal.jsx";
import "../components/chat/ChatLayout.css";
import { fakeAIReply } from "../components/chat/aiClient.js";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/axiosClient";
import {
  ensureInitialChat,
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,
  addUserMessage,
  addAIMessage,
  setChats,
} from "../store/chatSlice.js";

const isLocalHost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const SOCKET_BASE_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (isLocalHost
    ? "http://localhost:3000"
    : "https://ai-chat-ekbt.onrender.com");

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chats = useSelector((state) => state.chat.chats);
  const activeChatId = useSelector((state) => state.chat.activeChatId);
  const input = useSelector((state) => state.chat.input);
  const isSending = useSelector((state) => state.chat.isSending);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [socket, setSocket] = useState(null);

  const activeChat = chats.find((c) => (c._id || c.id) === activeChatId) || null;

  const [messages, setMessages] = useState([
    // {
    //   type: 'user',
    //   content: 'Hello, how can I help you today?'
    // },
    // {
    //   type: 'ai',
    //   content: 'Hi there! I need assistance with my account.'
    // }
  ]);

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleNewChat = () => {
    setIsNewChatOpen(true);
  };

  const handleCreateChat = async (title) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    try {
      const response = await api.post("/chat", {
        title: trimmedTitle,
      });

      dispatch(startNewChat(response.data.chat));
      setMessages([]);
      setSidebarOpen(false);
      setIsNewChatOpen(false);
    } catch (error) {
      console.error("Failed to create chat:", error);
      alert(error?.response?.data?.message || "Failed to create chat");
    }
  };

  // Ensure at least one chat exists initially
  useEffect(() => {
    api
      .get("/chat")
      .then((response) => {
        dispatch(setChats(response.data.chats.reverse()));
      });

    const tempSocket = io(SOCKET_BASE_URL, {
      withCredentials: true,
    });

    tempSocket.on("connect_error", (error) => {
      console.error("Socket connection failed:", error.message);
    });

    tempSocket.on("ai-response", (messagePayload) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          type: "ai",
          content: messagePayload.content,
        },
      ]);

      dispatch(sendingFinished());
    });
    setSocket(tempSocket);
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !activeChatId || isSending) return;
    dispatch(sendingStarted());

    const newMessages = [
      ...messages,
      {
        type: "user",
        content: trimmed,
      },
    ];

    setMessages(newMessages);
    dispatch(setInput(""));

    socket.emit("ai-message", {
      chat: activeChatId,
      content: trimmed,
    });

    // try {
    //   const reply = await fakeAIReply(trimmed);
    //   dispatch(addAIMessage(activeChatId, reply));
    // } catch {
    //   dispatch(addAIMessage(activeChatId, 'Error fetching AI response.', true));
    // } finally {
    //   dispatch(sendingFinished());
    // }
  };

  const getMessages = async (chatId) => {
    const response = await api.get(`/chat/messages/${chatId}`);

    setMessages(
      response.data.messages.map((m) => ({
        type: m.role === "user" ? "user" : "ai",
        content: m.content,
      }))
    );
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className={`chat-layout minimal ${sidebarOpen ? "sidebar-open" : ""}`}>
      <ChatMobileBar
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        onNewChat={handleNewChat}
      />
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          dispatch(selectChat(id));
          setSidebarOpen(false);
          getMessages(id);
        }}
        onNewChat={handleNewChat}
        onLogout={handleLogout}
        onLogin={handleLogin}
        isLoggedIn={isLoggedIn}
        open={sidebarOpen}
      />
      <main
        className={`chat-main ${messages.length === 0 ? "is-empty" : "has-messages"}`}
        role="main"
      >
        {activeChatId && !sidebarOpen && (
          <ChatNavbar
            title={activeChat?.title || "AI chat"}
            onBack={() => {
              dispatch(selectChat(null));
              setMessages([]);
              setSidebarOpen(false);
              navigate("/");
            }}
          />
        )}
        {messages.length === 0 && (
          <div className="chat-welcome" aria-hidden="true">
            <div className="chip">AI chat</div>
            <h1>Curated conversations with character</h1>
            <p>
              Ask anything, sketch ideas, or test prompts in a space designed
              to feel more like a crafted workspace than a standard assistant
              window.
            </p>
          </div>
        )}
        <ChatMessages messages={messages} isSending={isSending} />
        {activeChatId && (
          <ChatComposer
            input={input}
            setInput={(v) => dispatch(setInput(v))}
            onSend={sendMessage}
            isSending={isSending}
          />
        )}
      </main>
      <NewChatModal
        open={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onCreate={handleCreateChat}
      />
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
