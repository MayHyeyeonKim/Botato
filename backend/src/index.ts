import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { chatRoutes } from "./routes/chat"

const app = new Hono()

app.use(
    "/*",
    cors({
        origin: "http://localhost:5173",
        allowMethods: ["GET", "POST"],
        allowHeaders: ["Content-Type"]
    })
)

app.route("/", chatRoutes)

serve({ fetch: app.fetch, port: 3000 }, () => {
    console.log("🥔 Botato server running on http://localhost:3000")
})
