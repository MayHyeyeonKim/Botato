import { Ollama } from "ollama"

// Client for communicating with the local Ollama server
// Default port is 11434, so it connects to http://localhost:11434 by default
const ollama = new Ollama()

/**
 * Checks if the Ollama server is running
 * Timeout: 2 seconds (quick response required)
 */
export async function isOllamaRunning(): Promise<boolean> {
    try {
        // Ping the default endpoint of the Ollama server
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 2000)

        await fetch("http://localhost:11434", { signal: controller.signal })
        clearTimeout(timeout)
        return true
    } catch {
        return false
    }
}

/**
 * Returns a list of all Ollama models installed locally
 * Example: ["llama3.1", "mistral", "gemma"]
 */
export async function getAvailableModels(): Promise<string[]> {
    try {
        const response = await ollama.list()
        // Extract only the name field from the models array
        return response.models.map((model) => model.name)
    } catch {
        // Return an empty array if Ollama is not running or connection fails
        return []
    }
}
