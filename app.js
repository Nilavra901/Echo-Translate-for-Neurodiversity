import React, { useState, useRef } from 'react';

const EchoTranslate = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const socketRef = useRef(null);

  const toggleSession = () => {
    if (isRecording) {
      socketRef.current.close();
      setIsRecording(false);
    } else {
      // Connect to our FastAPI WebSocket
      socketRef.current = new WebSocket("ws://localhost:8000/ws/translate");
      
      socketRef.current.onmessage = (event) => {
        if (typeof event.data === "string") {
          setTranscript(event.data.replace("TEXT: ", ""));
        } else {
          // It's audio bytes! Play immediately
          const blob = new Blob([event.data], { type: 'audio/mpeg' });
          const url = URL.createObjectURL(blob);
          new Audio(url).play();
        }
      };
      setIsRecording(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-8 font-sans">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-indigo-900">EchoTranslate</h1>
        <p className="text-slate-500">Bridging the gap in human connection.</p>
      </header>

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={toggleSession}
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <span className="text-white font-bold">{isRecording ? 'STOP' : 'START'}</span>
          </button>

          <div className="w-full space-y-4 mt-8">
            <div className="p-4 bg-slate-100 rounded-xl min-h-[100px]">
              <label className="text-xs font-bold text-slate-400 uppercase">Real-time Clarification</label>
              <p className="text-lg text-slate-800 italic">"{transcript || "Start speaking to see the magic..."}"</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex gap-4">
        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">ElevenLabs Flash v2.5</span>
        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Whisper-1</span>
      </div>
    </div>
  );
};

export default EchoTranslate;

// A simple CSS-based visualizer to show the AI is "listening"
const Visualizer = ({ isActive }) => {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-indigo-500 rounded-full transition-all duration-150 ${
            isActive ? 'animate-bounce' : 'h-2'
          }`}
          style={{ 
            animationDelay: `${i * 0.05}s`,
            height: isActive ? `${Math.random() * 40 + 10}px` : '8px' 
          }}
        />
      ))}
    </div>
  );
};