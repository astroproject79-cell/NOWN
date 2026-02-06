/**
 * Gemini API 클라이언트
 *
 * - 용도별 모델 자동 라우팅 (Flash/Pro)
 * - 구조화된 JSON 출력 지원
 * - 재시도 로직 및 에러 핸들링
 */

import {
  GoogleGenerativeAI,
  GenerativeModel,
  GenerationConfig,
} from '@google/generative-ai';

import {
  type LLMRequest,
  type LLMResponse,
  type ModelConfig,
  type ModelPurpose,
  type RetryConfig,
  type GeminiModel,
  DEFAULT_MODEL_CONFIGS,
  DEFAULT_RETRY_CONFIG,
  LLMError,
} from './types';

// ============================================
// 클라이언트 클래스
// ============================================

export class GeminiClient {
  private client: GoogleGenerativeAI;
  private retryConfig: RetryConfig;

  constructor(apiKey?: string, retryConfig?: Partial<RetryConfig>) {
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) {
      throw new LLMError(
        'API_KEY_MISSING',
        'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.'
      );
    }

    this.client = new GoogleGenerativeAI(key);
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * 텍스트 생성
   */
  async generate(request: LLMRequest): Promise<LLMResponse<string>> {
    const config = this.resolveConfig(request);
    const model = this.getModel(config);
    const startTime = Date.now();

    const prompt = request.systemPrompt
      ? `${request.systemPrompt}\n\n${request.userPrompt}`
      : request.userPrompt;

    const result = await this.executeWithRetry(async () => {
      const response = await model.generateContent(prompt);
      return response;
    });

    const text = result.response.text();
    const latency = Date.now() - startTime;

    // 토큰 사용량 추출 (가능한 경우)
    const usage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    // usageMetadata가 있으면 추출
    if (result.response.usageMetadata) {
      usage.promptTokens = result.response.usageMetadata.promptTokenCount || 0;
      usage.completionTokens =
        result.response.usageMetadata.candidatesTokenCount || 0;
      usage.totalTokens = result.response.usageMetadata.totalTokenCount || 0;
    }

    return {
      content: text,
      model: config.model,
      usage,
      latency,
    };
  }

  /**
   * JSON 구조화 생성
   */
  async generateJSON<T>(request: LLMRequest): Promise<LLMResponse<T>> {
    const response = await this.generate({
      ...request,
      userPrompt: `${request.userPrompt}\n\n반드시 유효한 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.`,
    });

    try {
      // JSON 블록 추출 (```json ... ``` 형식 처리)
      let jsonText = response.content;

      // ```json 블록 제거
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      }

      // 앞뒤 공백 및 불필요한 문자 제거
      jsonText = jsonText.trim();

      const parsed = JSON.parse(jsonText) as T;

      return {
        ...response,
        content: parsed,
      };
    } catch (error) {
      throw new LLMError(
        'JSON_PARSE_ERROR',
        `JSON 파싱 실패: ${response.content.slice(0, 200)}...`,
        error
      );
    }
  }

  /**
   * 임베딩 생성
   */
  async embed(text: string): Promise<number[]> {
    const model = this.client.getGenerativeModel({
      model: 'text-embedding-004',
    });

    const result = await this.executeWithRetry(async () => {
      return await model.embedContent(text);
    });

    return result.embedding.values;
  }

  /**
   * 배치 임베딩
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    const model = this.client.getGenerativeModel({
      model: 'text-embedding-004',
    });

    const results = await Promise.all(
      texts.map((text) =>
        this.executeWithRetry(async () => {
          const result = await model.embedContent(text);
          return result.embedding.values;
        })
      )
    );

    return results;
  }

  // ============================================
  // 내부 헬퍼
  // ============================================

  /**
   * 요청에서 모델 설정 결정
   */
  private resolveConfig(request: LLMRequest): ModelConfig {
    const purpose = request.purpose || 'judge';
    const defaultConfig = DEFAULT_MODEL_CONFIGS[purpose];

    return {
      ...defaultConfig,
      ...request.config,
    };
  }

  /**
   * 모델 인스턴스 생성
   */
  private getModel(config: ModelConfig): GenerativeModel {
    const generationConfig: GenerationConfig = {
      temperature: config.temperature,
      maxOutputTokens: config.maxTokens,
      topP: config.topP,
      topK: config.topK,
    };

    return this.client.getGenerativeModel({
      model: config.model,
      generationConfig,
    });
  }

  /**
   * 재시도 로직
   */
  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    let delay = this.retryConfig.initialDelay;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // 마지막 시도였으면 에러 던지기
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }

        // Rate limit 에러인 경우만 재시도
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (
          !errorMessage.includes('429') &&
          !errorMessage.includes('rate') &&
          !errorMessage.includes('quota')
        ) {
          break;
        }

        // 대기 후 재시도
        await this.sleep(delay);
        delay = Math.min(
          delay * this.retryConfig.backoffMultiplier,
          this.retryConfig.maxDelay
        );
      }
    }

    throw new LLMError(
      'NETWORK_ERROR',
      `API 호출 실패 (${this.retryConfig.maxRetries}회 재시도 후)`,
      lastError
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================
// 싱글톤 인스턴스
// ============================================

let defaultClient: GeminiClient | null = null;

/**
 * 기본 클라이언트 가져오기
 */
export function getGeminiClient(): GeminiClient {
  if (!defaultClient) {
    defaultClient = new GeminiClient();
  }
  return defaultClient;
}

/**
 * 기본 클라이언트 초기화
 */
export function initGeminiClient(
  apiKey: string,
  retryConfig?: Partial<RetryConfig>
): GeminiClient {
  defaultClient = new GeminiClient(apiKey, retryConfig);
  return defaultClient;
}

// ============================================
// 편의 함수
// ============================================

/**
 * 텍스트 생성 (편의 함수)
 */
export async function generate(request: LLMRequest): Promise<string> {
  const client = getGeminiClient();
  const response = await client.generate(request);
  return response.content;
}

/**
 * JSON 생성 (편의 함수)
 */
export async function generateJSON<T>(request: LLMRequest): Promise<T> {
  const client = getGeminiClient();
  const response = await client.generateJSON<T>(request);
  return response.content;
}

/**
 * 임베딩 생성 (편의 함수)
 */
export async function embed(text: string): Promise<number[]> {
  const client = getGeminiClient();
  return client.embed(text);
}

/**
 * 배치 임베딩 (편의 함수)
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const client = getGeminiClient();
  return client.embedBatch(texts);
}
