import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../css/Chat.css";
import { io } from "socket.io-client";
import { ChatHeader, MessagesContainer, ChatInput } from "../components/ChatUI";
import { SettingsComponent } from "../components/SettingsComponent";
import { SearchComponent } from "../components/SearchComponent";
const socket = io("http://localhost:5000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [userId, setUserId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeMenu, setActiveMenu] = useState("chats");
  const [isTyping,setIsTyping]=useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`http://localhost:5000/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserId(res.data.userId);
      socket.emit("user_connected", res.data.userId);
    };
    fetchUser();
  }, [token]);

  useEffect(() => {
    socket.on("update_online_users", (users) => {
      setOnlineUsers(users);
    });
    return () => socket.off("update_online_users");
  }, []);
//receive message
  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (data.conversationId === selectedConversation) {
        setMessages((prev) => [
          ...prev,
          { ...data, isSentByMe: data.sender_id === userId },
        ]);
      }
    });

    return () => socket.off("receive_message");
  }, [selectedConversation, userId]);
//socket join convo
  useEffect(() => {
    if (selectedConversation) {
      socket.emit("join_conversation", selectedConversation);
    }
  }, [selectedConversation]);
//fetch convo
  useEffect(() => {
    const fetchConversations = async () => {
      const res = await axios.get("http://localhost:5000/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(res.data);
    };
    fetchConversations();
  }, [token]);
//fetchmessages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation || !userId) return;

      const res = await axios.get(
        `http://localhost:5000/chat/messages/${selectedConversation}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages(
        res.data.map((m) => ({
          ...m,
          isSentByMe: m.sender_id === userId,
        }))
      );
    };
    fetchMessages();
  }, [selectedConversation, userId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const res = await axios.post(
      "http://localhost:5000/chat/messages",
      {
        conversationId: selectedConversation,
        content: newMessage,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const receiverId = conversations.find(
      (c) => c.id === selectedConversation
    ).other_user_id;

    socket.emit("send_message", {
      ...res.data,
      receiverId,
      senderId: userId,
      conversationId: selectedConversation,
      message: newMessage,
    });

    setNewMessage("");
  };
  useEffect(()=>{
    socket.on("typing_indicator",(data)=>{
      console.log("typing event received:",data);
      if(data.conversationId===selectedConversation && data.senderId!==userId){
        setIsTyping(data.isTyping);
      }
      
    });
    return ()=> socket.off("typing_indicator");
  },[selectedConversation,userId])
  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="chat-page">

      <div className="menubar">
        <div className="menu-top">
          <button title="Chats" onClick={() => setActiveMenu("chats")} className={activeMenu === "chats" ? "active" : ""}>
            <i className="bi bi-chat-dots"></i>
          </button>

          <button title="Search" onClick={() => setActiveMenu("search")} className={activeMenu === "search" ? "active" : ""}>
            <i className="bi bi-search"></i>
          </button>

          <button title="Requests" onClick={() => setActiveMenu("requests")} className={activeMenu === "requests" ? "active" : ""}>
            <i className="bi bi-people"></i>
          </button>
        </div>

        <div className="menu-bottom">
          <button title="Settings" onClick={() => setActiveMenu("settings")} className={activeMenu === "settings" ? "active" : ""}>
            <i className="bi bi-gear"></i>
          </button>
        </div>
      </div>

      <div className="side-panel">
        <h2 style={{fontSize:"26px", textAlign:"center", padding:"10px", fontWeight:"bold"}}>{activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}</h2>
        {activeMenu === "chats" &&
          conversations.map((convo) => (
            <div
              key={convo.id}
              onClick={() => setSelectedConversation(convo.id)}
              className={`chat-list-item ${
                selectedConversation === convo.id ? "selected" : ""
              }`}
            >
              <span 
                className={`status-dot ${
                  onlineUsers.includes(convo.other_user_id) ? "online" : "offline"
                }`}
              ></span>

              <div className="chat-list-text">
                <h4>{convo.other_username}</h4>
                <p>{convo.last_message || "No messages yet"}</p>
              </div>
            </div>

          ))}

        {activeMenu === "search" && <SearchComponent/>}
        {activeMenu === "requests" && <div>Friend Request Component</div>}
        {activeMenu === "settings" && 
        <SettingsComponent userId={userId} token={token} handleLogout={handleLogout}/>}
      </div>

      <div className="chat-main">
        <ChatHeader
          conversation={conversations.find((c) => c.id === selectedConversation)}
          online={onlineUsers.includes(
            conversations.find((c) => c.id === selectedConversation)?.other_user_id
          )}
          isTyping={isTyping}
        />
        <MessagesContainer messages={messages} />
        {selectedConversation && (
          <ChatInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSend={handleSend}
            userId={userId}
            selectedConversation={selectedConversation}
            conversations={conversations}
            setIsTyping={setIsTyping}
          />
        )}
      </div>
    </div>
  );
}

export default Chat;
