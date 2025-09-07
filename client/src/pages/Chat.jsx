import { useState, useEffect ,useRef} from "react";
import axios from "axios";
import "../css/Chat.css";
import {io} from "socket.io-client";
const socket=io("http://localhost:5000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [userId,setUserId]=useState(null);
  const token = localStorage.getItem("token");
  const messagesEndRef=useRef(null);
  
  //fetch user info
  useEffect(()=>{
    const fetchUser=async()=>{
      const res=await axios.get(`http://localhost:5000/api/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserId(res.data.userId);
    };
    fetchUser();
  }, [token]);
  useEffect(()=>{
    if(messagesEndRef.current){
      setTimeout(()=>{
        messagesEndRef.current.scrollIntoView({behavior:"smooth"});
      },100)
    }
  },[messages]);
  useEffect(()=>{
    socket.on("receiveMessage",(data)=>{
      setMessages((prev)=>[...prev,
        {...data,isSentByMe:data.sender_id===userId}
      ]);
    })
    return ()=>socket.off("receiveMessage");
  },[userId]);
  useEffect(()=>{
    if(selectedConversation){
      socket.emit("join_conversation",selectedConversation);
    }
  })
  //fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get("http://localhost:5000/chat/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(res.data);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    };
    fetchConversations();
  }, [token]);
  //fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation || !userId) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/chat/messages/${selectedConversation}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data.map(m=>({
          ...m,
          isSentByMe:m.sender_id===userId
        })));
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [selectedConversation]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      const res = await axios.post(
        "http://localhost:5000/chat/messages",
        {
          conversationId: selectedConversation,
          content: newMessage,
          
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      /*setMessages((prev) => [...prev, { ...res.data, isSentByMe: true }]);*/
      socket.emit("send_message", { ...res.data, isSentByMe: true ,conversationId:selectedConversation});
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h2 className="sidebar-title">Chats</h2>
        {conversations.map((convo) => (
          <div
            key={convo.id}
            onClick={() => setSelectedConversation(convo.id)}
            className={`sidebar-item ${
              selectedConversation === convo.id ? "active" : ""
            }`}
          >
            <h3 className="sidebar-item-title">{convo.other_username}</h3>
            <p className="sidebar-item-message">
              {convo.last_message || "No messages yet"}
            </p>
            {convo.last_message_time && (
              <span className="sidebar-item-time">
                {new Date(convo.last_message_time).toLocaleTimeString()}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <h2 className="chat-header-title">
            {selectedConversation
              ? conversations.find((c) => c.id === selectedConversation)?.other_username ||
                "Chat"
              : "Select a conversation"}
          </h2>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${
                message.isSentByMe ? "sent" : "received"
              }`}
            >
              {message.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {selectedConversation && (
          <div className="chat-input-container">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="chat-input"
              
            />
            <button onClick={handleSend} className="chat-send-btn" >
              Send
            </button>
          </div>  
        )}
      </div>
    </div>
  );
}

export default Chat;
