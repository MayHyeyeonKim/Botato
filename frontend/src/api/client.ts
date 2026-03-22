import { Message } from "../types";

const API_URL = "http://localhost:3000";

export async function fetchModels(): Promise<string[]> {
  const response = await fetch(`${API_URL}/models`);
  if (!response.ok) throw new Error("Failed to fetch models");
  const data = await response.json();
  return data.models;
}

export async function fetchModes(): Promise<string[]> {
  const response = await fetch(`${API_URL}/modes`);
  if (!response.ok) throw new Error("Failed to fetch modes");
  const data = await response.json();
  return data.modes;
}

export async function sendMessage(
  message: string,
  mode: string,
  model: string,
  chatHistory: Message[],
  onChunk: (text: string) => void
): Promise<void> {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, mode, model, chatHistory }),
  });

  if (!response.ok) throw new Error("Server error");
  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split("\n");

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const chunk = line.slice(6).trim();
      if (chunk === "[DONE]") return;
      if (chunk.startsWith("[ERROR]")) throw new Error(chunk);
      if (chunk) {
        fullText += chunk;
        onChunk(fullText);
      }
    }
  }
}
