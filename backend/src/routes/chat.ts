import { Hono } from "hono"
import { streamSSE } from "hono/streaming"
import { getAvailableModels, isOllamaRunning } from "../services/ollama"
import { getModeNames } from "../services/modes"
import { getStreamingResponse } from "../services/langchain"
import type { ChatRequest } from "../types"

export const chatRoutes = new Hono()

/**
 * GET /health
 * Status check endpoint to verify server and Ollama status
 */
chatRoutes.get("/health", async (c) => {
    const ollama = await isOllamaRunning()
    return c.json({ status: "ok", ollama })
})

/**
 * GET /models
 * Returns a list of Ollama models installed locally
 * Example: { models: ["llama3.1", "mistral"] }
 */
chatRoutes.get("/models", async (c) => {
    // First, check if Ollama is running
    const ollama = await isOllamaRunning()
    if (!ollama) {
        return c.json(
            { error: "Ollama is not running. Run: ollama serve" },
            503
        )
    }

    const models = await getAvailableModels()
    if (!models.length) {
        return c.json(
            { error: "No models found. Run: ollama pull llama3.1" },
            404
        )
    }
    return c.json({ models })
})

/**
 * GET /modes
 * Returns a list of available mode names
 * Example: { modes: ["Common Conversation", "Study Assistant", ...] }
 */
chatRoutes.get("/modes", (c) => {
    return c.json({ modes: getModeNames() })
})

/**
 * POST /chat
 * Sends LLM responses via SSE (Server-Sent Events) streaming
 *
 * Request body:
 * {
 *   message: string        — User message
 *   mode: string          — Selected mode
 *   model: string         — Selected LLM model
 *   chatHistory: Message[] — Previous chat history
 * }
 *
 * Response (SSE):
 * data: Hello
 * data: World
 * data: [DONE]
 */
chatRoutes.post("/chat", async (c) => {
    try {
        const body = await c.req.json<ChatRequest>()

        // SSE streaming to send LLM responses
        return streamSSE(c, async (stream) => {
            try {
                // Receive chunks from LangChain and send them to the client immediately
                for await (const chunk of getStreamingResponse(body)) {
                    await stream.writeSSE({ data: chunk }) // Send each chunk as an SSE message
                }
                // Streaming complete signal
                await stream.writeSSE({ data: "[DONE]" })
            } catch (error) {
                // Send error message if an error occurs
                await stream.writeSSE({
                    data: "[ERROR] " + String(error)
                })
            }
        })
    } catch (error) {
        return c.json({ error: String(error) }, 400)
    }
})
