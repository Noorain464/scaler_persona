import React, { useState } from 'react';
import { User, Bot, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import BookingWidget from '../booking/BookingWidget';

const ChatMessage = ({ message, isBot, sources, suggestBooking, onBook }) => {
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[80%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center 
          ${isBot ? 'bg-indigo-600 text-white mr-3' : 'bg-gray-200 text-gray-700 ml-3'}`}>
          {isBot ? <Bot size={20} /> : <User size={20} />}
        </div>

        {/* Message Content */}
        <div className="flex flex-col">
          <div className={`py-3 px-4 rounded-2xl ${
            isBot ? 'bg-white shadow-sm border border-gray-100 text-gray-800 rounded-tl-none' 
                  : 'bg-indigo-600 text-white rounded-tr-none'
          }`}>
            <p className="whitespace-pre-wrap leading-relaxed">{message}</p>
          </div>
          
          {/* Booking Suggestion */}
          {isBot && suggestBooking && (
            <div className="mt-3">
              <BookingWidget onBook={onBook} />
            </div>
          )}

          {/* Sources Dropdown */}
          {isBot && sources && sources.length > 0 && (
            <div className="mt-2 text-sm">
              <button 
                onClick={() => setShowSources(!showSources)}
                className="flex items-center text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
              >
                {showSources ? <ChevronUp size={14} className="mr-1" /> : <ChevronDown size={14} className="mr-1" />}
                {showSources ? 'Hide Sources' : `${sources.length} Sources Used`}
              </button>
              
              {showSources && (
                <div className="mt-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <ul className="space-y-2">
                    {sources.map((source, idx) => (
                      <li key={idx} className="flex flex-col bg-white p-2 rounded border border-gray-100 shadow-sm">
                        <span className="font-medium text-indigo-700 text-xs flex items-center">
                          {source.title || 'Knowledge Base'}
                          {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-gray-400 hover:text-indigo-500"><ExternalLink size={12}/></a>}
                        </span>
                        <span className="text-gray-600 text-xs mt-1 italic">"{source.snippet || source.content}"</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatMessage;
