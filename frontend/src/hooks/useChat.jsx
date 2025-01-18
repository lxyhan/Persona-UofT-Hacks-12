import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = "http://localhost:3000";
// import.meta.env.VITE_API_URL ||
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const chat = async (message) => {
    setLoading(true);
    console.log("Tried to access backend");
  
    try {
      const data = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
  
      // Parse the response
      const responseJson = await data.json();
  
      // Validate that 'responseJson.messages' is an array before proceeding
      const resp = responseJson.messages;
  
      if (Array.isArray(resp)) {
        setMessages((messages) => [...messages, ...resp]);
      } else {
        console.error("Expected 'messages' to be an array, but received:", resp);
      }
    } catch (error) {
      console.error("Error fetching chat data:", error);
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
