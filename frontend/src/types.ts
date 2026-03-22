export type Role = "user" | "assistant";

export interface Message {
  role: Role;
  content: string;
}

export interface ChatRequest {
  message: string;
  mode: string;
  model: string;
  chatHistory: Message[];
}
