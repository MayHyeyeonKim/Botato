# Botato 🥔

> A playful local LLM chatbot for private, offline use.
> No internet. No API costs. Just you and your potato. 🥔

## Stack

- Node.js + TypeScript
- React (Frontend)
- Hono (Backend Server)
- LangChain + Ollama (llama3.1)

## Project Structure

```
botato/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Hono server entry point
│   │   ├── types.ts              # TypeScript type definitions
│   │   ├── routes/
│   │   │   └── chat.ts           # Chat API endpoints
│   │   └── services/
│   │       ├── langchain.ts      # LangChain integration
│   │       ├── ollama.ts         # Ollama LLM setup
│   │       └── modes.ts          # Chat modes & behaviors
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx               # React entry point
│   │   ├── App.tsx                # Main app component
│   │   ├── App.css                # App styles
│   │   ├── types.ts               # TypeScript interfaces
│   │   ├── components/
│   │   │   ├── Sidebar.tsx        # Mode & model selector
│   │   │   ├── Sidebar.css
│   │   │   ├── ChatBox.tsx        # Message display
│   │   │   ├── ChatBox.css
│   │   │   ├── ChatInput.tsx      # Input & send button
│   │   │   └── ChatInput.css
│   │   └── api/
│   │       └── client.ts          # API calls & SSE streaming
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

## Made by MaybePotato

Learning project — Hono + React + LangChain + Ollama (2026)
