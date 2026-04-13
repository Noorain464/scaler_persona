import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from '../components/chat/ChatMessage';
import { sendMessage } from '../services/chatService';
import { Send, Loader } from 'lucide-react';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: "Hi, I'm Syeda Noorain. Ask me about my projects, experience, or technical background.",
      isBot: true
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { content: userMessage, isBot: false }]);
    setIsLoading(true);

    try {
      // 1. Send to standard chat
      const data = await sendMessage(userMessage);
      
      // Determine if a booking should be suggested natively based on semantics
      // E.g., if user asks about "availability", "schedule", "book a call"
      const lowerReq = userMessage.toLowerCase();
      const needsBooking = lowerReq.includes("book") || lowerReq.includes("available") || lowerReq.includes("schedule") || lowerReq.includes("call");

      setMessages(prev => [
        ...prev, 
        { 
          content: data.answer || "I'm sorry, I encountered an error processing that.", 
          sources: data.sources || [], 
          isBot: true,
          suggestBooking: needsBooking
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev, 
        { content: "Sorry, I am currently unable to reach my backend brain.", isBot: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white z-10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Syeda Noorain</h2>
          <p className="text-sm text-gray-500">Ask about my projects, work experience, or schedule a chat.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg, i) => (
            <ChatMessage 
              key={i} 
              message={msg.content} 
              isBot={msg.isBot} 
              sources={msg.sources} 
              suggestBooking={msg.suggestBooking} 
            />
          ))}
          {isLoading && (
            <div className="flex justify-start w-full mb-6 max-w-[80%]">
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3 flex-shrink-0 text-white">
                <Loader size={18} className="animate-spin" />
              </div>
              <div className="py-3 px-5 rounded-2xl bg-white border border-gray-100 rounded-tl-none flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} className="h-4"></div>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSend} className="relative flex items-center w-full">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about Noorain's technical background..."
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-2">AI can make mistakes. Verify important answers.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
