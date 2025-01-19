import { createContext, useContext, useEffect, useState, useRef } from "react";

const backendUrl = "http://localhost:3000";
// import.meta.env.VITE_API_URL ||
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  console.log("ChatProvider initialized"); // Add this
  const chat = async (message) => {
    console.log("CHAT FUNCTION CALLED WITH:", message);  // More visible logging
    setLoading(true);
    
    try {
      console.log("Making fetch request to:", `${backendUrl}/chat`);
      const response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      await fetch(`${backendUrl}/zoom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      console.log("Raw response:", response);
      const responseJson = await response.json();
      console.log("Parsed response:", responseJson);
  
      const resp = responseJson.messages;
      console.log("Messages array:", resp);
  
      if (Array.isArray(resp)) {
        console.log("Setting messages to:", [...messages, ...resp]);
        setMessages((messages) => [...messages, ...resp]);
      } else {
        console.error("Not an array:", resp);
      }
    } catch (error) {
      console.error("CHAT ERROR:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };
  
  console.log("💫 ChatProvider initialized");

  useEffect(() => {
    // Create WebSocket directly without ref
    const ws = new WebSocket('ws://localhost:8081');
    
    console.log('CREATED NEW WEBSOCKET');

    // Super simple message handler
    ws.addEventListener('message', function(event) {
      console.log('RAW MESSAGE RECEIVED:', event.data);
      // Don't even try to process it yet, just prove we can receive
    });

    // Log literally everything
    ws.addEventListener('open', () => console.log('SOCKET OPENED'));
    ws.addEventListener('close', () => console.log('SOCKET CLOSED'));
    ws.addEventListener('error', (e) => console.log('SOCKET ERROR:', e));

    return () => ws.close();
  }, []);


  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

// Somewhere after calling the chat component here, we need to make a call to process the user's emotions while they listen to the answer
// Just hardcode the call it don't matter at this point
