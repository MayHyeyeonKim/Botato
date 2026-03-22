import { useEffect, useRef } from "react";
import { Message } from "../types";
import "./ChatBox.css";

interface ChatBoxProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatBox({ messages, isLoading }: ChatBoxProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="chatbox">
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message message-${msg.role}`}
          >
            {msg.role === "assistant" && <span className="avatar">🥔</span>}
            <div className="bubble">
              <p>{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message message-assistant">
            <span className="avatar">🥔</span>
            <div className="bubble">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}
