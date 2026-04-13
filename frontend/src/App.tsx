import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import './index.css';

type ChatMessage = {
  id: number;
  role: 'assistant' | 'user';
  content: string;
  sources?: string[];
  type?: string;
  slots?: string[];
  eventId?: string;
  eventLink?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://scaler-persona.onrender.com';

const getIstDatePart = (slot: string) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(slot));

  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  const day = parts.find(part => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
};

const formatSlot = (slot: string) => {
  const label = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(slot));

  return `${label} IST`;
};

const toBookingDraft = (slot: string) => {
  const datePart = getIstDatePart(slot);
  const timePart = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(slot));

  return `Book ${datePart} at ${timePart} under `;
};

const shouldShowSources = (message: ChatMessage) => {
  const lowerContent = message.content.toLowerCase();
  const isBookingMessage = message.type === 'availability' ||
    message.type?.startsWith('booking') ||
    lowerContent.includes('calendar invite') ||
    lowerContent.includes("i've booked") ||
    lowerContent.includes('booked the meeting');

  return !isBookingMessage && Boolean(message.sources?.length);
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      content: "Hi, I'm Syeda Noorain. Ask me about my projects, experience, or technical background.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSlotClick = (slot: string) => {
    setInput(toBookingDraft(slot));
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userText = input.trim();
    if (!userText || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: userText,
    };

    const history = messages
      .filter((message) => message.id !== 1)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history,
        }),
      });

      const data = await response.json();

      if (!response.ok || (!data.success && !data.answer)) {
        throw new Error(data.error || 'Chat request failed');
      }

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.answer || 'I could not find an answer for that.',
          sources: data.sources || [],
          type: data.type,
          slots: data.slots || [],
          eventId: data.eventId,
          eventLink: data.eventLink,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Sorry, I could not reach the backend right now. Please try again in a moment.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="chat-panel">
        <header className="chat-header">
          <div>
            <p className="eyebrow">Portfolio Chat</p>
            <h1>Syeda Noorain</h1>
          </div>
          <span className="status">Backend: {API_BASE_URL}</span>
        </header>

        <div className="messages">
          {messages.map((message) => (
            <article className={`message ${message.role}`} key={message.id}>
              <p>{message.content}</p>
              {shouldShowSources(message) && (
                <small>Sources: {message.sources.join(', ')}</small>
              )}
              {message.slots && message.slots.length > 0 && (
                <div className="slot-list">
                  {message.slots.map((slot) => (
                    <button className="slot-pill" key={slot} type="button" onClick={() => handleSlotClick(slot)}>
                      {formatSlot(slot)}
                    </button>
                  ))}
                </div>
              )}
              {message.eventLink && (
                <a className="event-link" href={message.eventLink} target="_blank" rel="noreferrer">
                  Open calendar event
                </a>
              )}
              {message.eventId && (
                <small>Calendar event ID: {message.eventId}</small>
              )}
            </article>
          ))}
          {isLoading && (
            <article className="message assistant">
              <p>Thinking...</p>
            </article>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about my projects..."
          />
          <button disabled={isLoading || !input.trim()} type="submit">
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
