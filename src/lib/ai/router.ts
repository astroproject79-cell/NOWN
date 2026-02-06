import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '@/lib/supabase';

export type AIModel = 'gpt-4o' | 'gpt-4o-mini' | 'claude-3.5-sonnet' | 'gemini-pro';

var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
var anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
var genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function getActiveModel(purpose: string): Promise<string> {
  try {
    var key = purpose === 'report' ? 'report_model' : 'ai_model';
    var result = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', key)
      .single();
    if (result.data && result.data.value) {
      var raw = result.data.value;
      if (typeof raw === 'string') {
        try { raw = JSON.parse(raw); } catch (e) {}
      }
      var cleaned = String(raw).replace(/[\\"]/g, '').trim();
      console.log('[AI Router] model:', cleaned);
      return cleaned || 'gpt-4o-mini';
    }
  } catch (e) { console.log('[AI Router] fallback:', e); }
  return 'gpt-4o-mini';
}

interface StreamOptions {
  model: string;
  system: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
}

export async function streamGenerate(opts: StreamOptions) {
  var model = opts.model;
  var system = opts.system;
  var messages = opts.messages;
  var temperature = opts.temperature || 0.8;
  var maxTokens = opts.maxTokens || 300;

  if (model.indexOf('gpt') >= 0) {
    var openaiMsgs: any[] = [{ role: 'system', content: system }];
    for (var i = 0; i < messages.length; i++) {
      openaiMsgs.push({ role: messages[i].role, content: messages[i].content });
    }
    var stream = await openai.chat.completions.create({
      model: model,
      messages: openaiMsgs,
      temperature: temperature,
      max_tokens: maxTokens,
      stream: true,
    });
    return {
      type: 'openai' as const,
      stream: stream,
    };
  }

  if (model.indexOf('claude') >= 0) {
    var claudeMsgs: any[] = [];
    for (var j = 0; j < messages.length; j++) {
      claudeMsgs.push({ role: messages[j].role, content: messages[j].content });
    }
    var claudeStream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: system,
      messages: claudeMsgs,
    });
    return {
      type: 'anthropic' as const,
      stream: claudeStream,
    };
  }

  if (model.indexOf('gemini') >= 0) {
    var gemini = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    var history: any[] = [];
    var lastUserMsg = '';
    for (var k = 0; k < messages.length; k++) {
      if (k === messages.length - 1 && messages[k].role === 'user') {
        lastUserMsg = messages[k].content;
      } else {
        history.push({
          role: messages[k].role === 'assistant' ? 'model' : 'user',
          parts: [{ text: messages[k].content }],
        });
      }
    }
    var chat = gemini.startChat({
      history: history,
      generationConfig: { temperature: temperature, maxOutputTokens: maxTokens },
      systemInstruction: { role: 'user', parts: [{ text: system }] },
    });
    var geminiStream = await chat.sendMessageStream(lastUserMsg || '안녕하세요');
    return {
      type: 'gemini' as const,
      stream: geminiStream,
    };
  }

  throw new Error('Unknown model: ' + model);
}

interface GenerateOptions {
  model: string;
  system: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export async function generate(opts: GenerateOptions) {
  var model = opts.model;
  var system = opts.system;
  var prompt = opts.prompt;
  var temperature = opts.temperature || 0.7;
  var maxTokens = opts.maxTokens || 4000;

  if (model.startsWith('gpt')) {
    var res = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature: temperature,
      max_tokens: maxTokens,
    });
    return {
      content: res.choices[0]?.message?.content || '',
      model: model,
      tokens: res.usage?.total_tokens,
    };
  }

  if (model.indexOf('claude') >= 0) {
    var claudeRes = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: system,
      messages: [{ role: 'user', content: prompt }],
    });
    var textBlock = claudeRes.content.find(function(b: any) { return b.type === 'text'; });
    return {
      content: textBlock ? (textBlock as any).text : '',
      model: model,
      tokens: claudeRes.usage.input_tokens + claudeRes.usage.output_tokens,
    };
  }

  if (model.indexOf('gemini') >= 0) {
    var geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    var geminiRes = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: system + '\n\n' + prompt }] }],
      generationConfig: { temperature: temperature, maxOutputTokens: maxTokens },
    });
    return {
      content: geminiRes.response.text(),
      model: model,
    };
  }

  throw new Error('Unknown model: ' + model);
}

export function cleanMarkdown(text: string) {
  return text
    .replace(/#{1,6}\s?/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^[-*]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim();
}
