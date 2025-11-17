import React,{useState,useEffect,useRef, use} from "react";
import '../css/Chat.css'
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");

export function ChatHeader({ conversation, online ,isTyping}) {
  if (!conversation) {
    return (
      <div className="chat-header">
        <h2 className="chat-header-title">Select a conversation</h2>
      </div>
    );
  }

  return (
    <div className="chat-header">
      <h2 className="chat-header-title">
        <span
          className={`status-indicator ${online ? "online" : "offline"}`}
        ></span>
        {conversation.other_username}
      </h2>
      {isTyping && <p className="typing-indicator">Typing...</p>}
    </div>
    
  );
}
export function MessagesContainer({ messages }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  }, [messages]);

  return (
    <div className="chat-messages">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`chat-message ${
            message.isSentByMe ? "sent" : "received"
          }`}
        >
          {message.content || message.message}
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
}
export function ChatInput({ newMessage, setNewMessage, handleSend,userId,selectedConversation,conversations,setIsTyping }) {
  
  const handleTyping=()=>{
    const receiverId=conversations.find(c=>c.id===selectedConversation)?.other_user_id;
    socket.emit("typing",{
      senderId:userId,
      receiverId,
      conversationId:selectedConversation,
      isTyping:true
    })
    clearTimeout(window.typingTimeout);
    window.typingTimeout=setTimeout(()=>{
      socket.emit("typing",{
        senderId:userId,
        receiverId,
        conversationId:selectedConversation,
        isTyping:false
      })
    },2000)
  }
  return (
    <div className="chat-input-container">
      <input
        type="text"
        value={newMessage}
        onChange={(e) => {
          setNewMessage(e.target.value);
          handleTyping();
        }}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Type your message..."
        className="chat-input"
      />
      <button onClick={handleSend} className="chat-send-btn">
        Send
      </button>
    </div>
  );
}