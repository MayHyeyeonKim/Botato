// 채팅 메시지의 역할 — 사용자 또는 어시스턴트
export type Role = "user" | "assistant"

// 채팅 메시지 인터페이스
export interface Message {
    role: Role
    content: string
}

// 클라이언트에서 받는 채팅 요청
export interface ChatRequest {
    message: string
    mode: string
    model: string
    chatHistory: Message[]
}
