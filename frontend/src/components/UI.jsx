import { useRef, useEffect, useState } from "react";
import { useChat } from "../hooks/useChat";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [recordedMessage, setRecordedMessage] = useState(null);
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          console.log("Recording stopped, processing audio...");
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          console.log("Audio blob created:", audioBlob);

          const formData = new FormData();
          formData.append("file", audioBlob, "audio.webm");
          formData.append("model", "whisper-1");

          try {
            console.log("Sending request to Whisper API...");
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
              },
              body: formData
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              console.error("API Error:", errorData);
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Transcription result:", data);
            
            if (data.text) {
              setRecordedMessage(data.text);
              chat(data.text);
            }
          } catch (error) {
            console.error('Error transcribing audio:', error);
            alert('Error transcribing audio. Please try again.');
          }
        };

        setAudioStream({ stream, mediaRecorder });
        mediaRecorder.start();
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    } else if (audioStream) {
      audioStream.mediaRecorder.stop();
      audioStream.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(!isRecording);
  };

  const sendMessage = () => {
    if (recordedMessage) {
      chat(recordedMessage);
      setRecordedMessage(null);
    } else {
      const text = input.current.value;
      if (!loading && !message) {
        chat(text);
        input.current.value = "";
      }
    }
  };


useEffect(() => {
  const handleMessage = (event) => {
    if (event.data.type === "speech-to-chatbot") {
      console.log("Received message from speech app:", event.data.message);
      chat(event.data.message); // Use the chat function to process the text
      
    }
  };

  window.addEventListener("message", handleMessage);

  return () => {
    window.removeEventListener("message", handleMessage);
  };
}, [chat]);
  
return (
  <div className="fixed inset-0 z-10 flex flex-col justify-between p-8">
    {/* Header */}
    <div className="self-start rounded-2xl bg-black/50 p-6 border border-white/10 shadow-xl">
      <h1 className="text-3xl font-bold text-white">
        Mme. Dubois
      </h1>
      <p className="text-lg text-white/70">French Teacher</p>
    </div>

    {/* Recording Status */}
    {isRecording && (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-3 bg-black/70 px-6 py-4 rounded-full border border-white/20">
          <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-white">Recording...</span>
        </div>
      </div>
    )}

    {/* Input Area */}
    <div className="flex items-center gap-4 max-w-3xl mx-auto w-full">
      <div className="flex-1 relative">
        <input
          className="w-full h-16 px-6 rounded-full bg-black/50 border border-white/10 text-white placeholder:text-white/50 text-lg focus:outline-none focus:ring-2 focus:ring-white/30"
          placeholder={recordedMessage || "Ask me anything..."}
          ref={input}
          disabled={recordedMessage !== null}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          onClick={toggleRecording}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full 
            ${isRecording ? 'bg-red-500' : 'bg-white/10'} 
            hover:bg-white/20 transition-all border border-white/10`}
        >
          {isRecording ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>
      
      <button
        disabled={loading || (message && !recordedMessage)}
        onClick={sendMessage}
        className={`h-16 px-8 rounded-full border border-white/10 text-white font-semibold 
          transition-all disabled:opacity-50 disabled:hover:bg-white/10
          ${recordedMessage ? 'bg-green-500 hover:bg-green-600' : 'bg-white/10 hover:bg-white/20'}`}
      >
        Send
      </button>
    </div>
  </div>
);
};