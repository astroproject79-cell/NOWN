/**
 * LLM 관련 타입 정의
 */

// ============================================
// 모델 설정
// ============================================

/**
 * 사용 가능한 Gemini 모델
 */
export type GeminiModel =
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-lite'
  | 'gemini-1.5-pro';

/**
 * 모델 용도별 라우팅
 */
export type ModelPurpose = 'judge' | 'improver' | 'verify' | 'embed';

/**
 * 모델 설정
 */
export interface ModelConfig {
  model: GeminiModel;
  temperature: number;
  maxTokens: number;
  topP?: number;
  topK?: number;
}

/**
 * 용도별 기본 모델 설정
 */
export const DEFAULT_MODEL_CONFIGS: Record<ModelPurpose, ModelConfig> = {
  judge: {
    model: 'gemini-2.0-flash',
    temperature: 0.2,
    maxTokens: 4000,
  },
  improver: {
    model: 'gemini-2.0-flash',
    temperature: 0.5,
    maxTokens: 8000,
  },
  verify: {
    model: 'gemini-2.0-flash-lite',
    temperature: 0.1,
    maxTokens: 2000,
  },
  embed: {
    model: 'gemini-2.0-flash',
    temperature: 0,
    maxTokens: 0, // 임베딩에는 사용 안 함
  },
};

// ============================================
// 요청/응답
// ============================================

/**
 * LLM 요청
 */
export interface LLMRequest {
  /** 시스템 프롬프트 */
  systemPrompt?: string;
  /** 사용자 프롬프트 */
  userPrompt: string;
  /** 모델 용도 (자동 라우팅) */
  purpose?: ModelPurpose;
  /** 커스텀 모델 설정 (purpose보다 우선) */
  config?: Partial<ModelConfig>;
  /** JSON 스키마 (구조화된 출력) */
  jsonSchema?: object;
}

/**
 * LLM 응답
 */
export interface LLMResponse<T = string> {
  /** 응답 내용 */
  content: T;
  /** 사용된 모델 */
  model: GeminiModel;
  /** 토큰 사용량 */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** 응답 시간 (ms) */
  latency: number;
}

// ============================================
// 에러
// ============================================

/**
 * LLM 에러 타입
 */
export type LLMErrorType =
  | 'API_KEY_MISSING'
  | 'RATE_LIMIT'
  | 'INVALID_REQUEST'
  | 'NETWORK_ERROR'
  | 'JSON_PARSE_ERROR'
  | 'UNKNOWN';

/**
 * LLM 에러
 */
export class LLMError extends Error {
  constructor(
    public type: LLMErrorType,
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

// ============================================
// 재시도 설정
// ============================================

/**
 * 재시도 설정
 */
export interface RetryConfig {
  /** 최대 재시도 횟수 */
  maxRetries: number;
  /** 초기 대기 시간 (ms) */
  initialDelay: number;
  /** 최대 대기 시간 (ms) */
  maxDelay: number;
  /** 백오프 배수 */
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};
