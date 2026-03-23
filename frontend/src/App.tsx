import { useState, useEffect } from "react";
import { Message } from "./types";
import { fetchModels, fetchModes, sendMessage, summarizeHistory } from "./api/client";
import Sidebar from "./components/Sidebar";
import ChatBox from "./components/ChatBox";
import ChatInput from "./components/ChatInput";
import "./App.css";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [modes, setModes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch modes and models on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const fetchedModes = await fetchModes();
        const fetchedModels = await fetchModels();

        setModes(fetchedModes);
        setModels(fetchedModels);

        // Select first mode and model
        if (fetchedModes.length > 0) setSelectedMode(fetchedModes[0]);
        if (fetchedModels.length > 0) setSelectedModel(fetchedModels[0]);

        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to initialize app";
        setError(`⚠️ Backend connection failed: ${errorMsg}`);
      }
    };

    initializeApp();
  }, []);

  const handleModeChange = (newMode: string) => {
    if (messages.length === 0) {
      setSelectedMode(newMode);
      return;
    }

    // Confirm mode change
    const confirmed = window.confirm("Changing mode will clear the conversation. Continue?");
    if (confirmed) {
      setSelectedMode(newMode);
      setMessages([]);
    }
  };

  const handleModelChange = (newModel: string) => {
    if (messages.length === 0) {
      setSelectedModel(newModel);
      return;
    }

    // Confirm model change
    const confirmed = window.confirm("Changing model will clear the conversation. Continue?");
    if (confirmed) {
      setSelectedModel(newModel);
      setMessages([]);
    }
  };

  const handleClearChat = () => {
    const confirmed = window.confirm("Clear conversation?");
    if (confirmed) {
      setMessages([]);
      setError(null);
    }
  };

  const handleSendMessage = async (userMessage: string) => {
    // Add user message
    const userMsg: Message = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      let assistantResponse = "";

      // Prepare chat history with summarization if needed
      let chatHistoryToSend: Message[] = [...messages, userMsg];

      if (messages.length >= 5) {
        try {
          // Summarize older messages, keep last 4 messages
          const olderMessages = messages.slice(0, -4);
          const recentMessages = messages.slice(-4);

          const summary = await summarizeHistory(
            olderMessages,
            selectedMode,
            selectedModel
          );

          chatHistoryToSend = [
            {
              role: "assistant",
              content: `[Previous conversation summary: ${summary}]`,
            },
            ...recentMessages,
            userMsg,
          ];
        } catch (summaryErr) {
          // If summarization fails, use last 10 messages
          chatHistoryToSend = [...messages.slice(-10), userMsg];
        }
      }

      await sendMessage(userMessage, selectedMode, selectedModel, chatHistoryToSend, (chunk) => {
        assistantResponse = chunk;
        // Update message in real-time
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            lastMsg.content = chunk;
          }
          return updated;
        });
      });

      // Finalize message
      if (assistantResponse) {
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            lastMsg.content = assistantResponse;
          } else {
            updated.push({ role: "assistant", content: assistantResponse });
          }
          return updated;
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
      setError(`⚠️ Error: ${errorMsg}`);

      // Remove failed message
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {error && <div className="error-banner">{error}</div>}

      <Sidebar
        modes={modes}
        models={models}
        selectedMode={selectedMode}
        selectedModel={selectedModel}
        onModeChange={handleModeChange}
        onModelChange={handleModelChange}
        onClearChat={handleClearChat}
      />

      <div className="main-content">
        <ChatBox messages={messages} isLoading={isLoading} />
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
