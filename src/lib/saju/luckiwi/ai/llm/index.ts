/**
 * LLM 모듈
 *
 * Gemini API 클라이언트와 프롬프트 템플릿
 */

// 타입 내보내기
export * from './types';

// Gemini 클라이언트
export {
  GeminiClient,
  getGeminiClient,
  initGeminiClient,
  generate,
  generateJSON,
  embed,
  embedBatch,
} from './gemini';

// 프롬프트 템플릿
export {
  JUDGE_SYSTEM_PROMPT,
  buildJudgeUserPrompt,
  type JudgePromptContext,
  type JudgeResponse,
} from './prompts/judgePrompt';

export {
  IMPROVER_SYSTEM_PROMPT,
  buildImproverUserPrompt,
  type ImproverPromptContext,
  type ImproverResponse,
} from './prompts/improverPrompt';

export {
  VERIFY_SYSTEM_PROMPT,
  buildVerifyUserPrompt,
  type VerifyPromptContext,
  type VerifyResponse,
} from './prompts/verifyPrompt';
