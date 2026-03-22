import { ChatOllama } from "@langchain/ollama"
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { HumanMessage, AIMessage } from "@langchain/core/messages"
import { MODES } from "./modes"
import type { ChatRequest } from "../types"

/**
 * LangChain 체인 생성
 * 모드에 따른 시스템 프롬프트 + 대화 기록 + 사용자 입력을 연결
 *
 * LCEL (LangChain Expression Language) 패턴:
 * 프롬프트 -> LLM -> 출력 파서
 */
function buildChain(model: string, mode: string) {
    // 선택된 모드의 시스템 프롬프트 가져오기
    // 없으면 기본값 사용
    const systemPrompt =
        MODES[mode]?.systemPrompt ?? MODES["Common Conversation"].systemPrompt

    // ChatOllama: streaming=true로 설정하면 조각씩 응답 전송
    const llm = new ChatOllama({
        model,
        streaming: true
    })

    // 프롬프트 템플릿 구성:
    // 1. system: 모드별 시스템 프롬프트
    // 2. MessagesPlaceholder: 이전 대화 기록 삽입
    // 3. human: 현재 사용자 메시지
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", systemPrompt],
        new MessagesPlaceholder("chatHistory"),
        ["human", "{input}"]
    ])

    // LCEL 체인: 프롬프트 -> LLM -> 문자열 변환
    // pipe() 메서드로 각 단계를 연결
    return prompt.pipe(llm).pipe(new StringOutputParser())
}

/**
 * 스트리밍 응답 비동기 제너레이터
 * Hono의 SSE 스트리밍에서 사용됨
 *
 * yield를 사용해 조각씩 응답을 전송하므로
 * "word by word" 타이핑 효과 가능
 */
export async function* getStreamingResponse(
    request: ChatRequest
): AsyncGenerator<string> {
    const { message, mode, model, chatHistory } = request

    const chain = buildChain(model, mode)

    // 프론트엔드에서 받은 메시지 배열을 LangChain의 메시지 형태로 변환
    // - role === "user" → HumanMessage
    // - role === "assistant" → AIMessage
    // chatHistory가 없으면 빈 배열 사용
    const history = (chatHistory ?? []).map((msg) =>
        msg.role === "user"
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content)
    )

    // chain.stream()은 비동기 이터레이터 반환
    // stream() 메서드로 LLM 응답을 조각씩 받음
    for await (const chunk of await chain.stream({
        chatHistory: history,
        input: message
    })) {
        // chunk가 존재하면 yield (빈 문자열 제외)
        if (chunk) yield chunk
    }
}
