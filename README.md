# 나운 NOWN

사주명리 기반 AI 운명 리포트 서비스

<br>

## Overview

생년월일시 기반의 사주팔자 분석과 AI 해석을 결합한 프리미엄 운세 서비스입니다.
16,000자 분량의 심층 리포트와 실시간 AI 상담 기능을 제공합니다.

<br>

## Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Landing  │→ │ Fortune  │→ │  Chat    │→ │ Payment/Report   │ │
│  │  Page    │  │  Input   │  │  (AI)    │  │    Flow          │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js 14 (App Router)                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     API Routes                          │    │
│  │  /api/saju/calculate  → 사주 계산 엔진                   │    │
│  │  /api/chat            → AI 스트리밍 상담                 │    │
│  │  /api/report/generate → 8섹션 병렬 AI 리포트             │    │
│  │  /api/payment/confirm → 결제 검증 + 보안                 │    │
│  │  /api/admin/*         → 관리자 API                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    Supabase      │  │   AI Providers   │  │   Toss Payments  │
│  ┌────────────┐  │  │  ┌────────────┐  │  │                  │
│  │   users    │  │  │  │  OpenAI    │  │  │  결제 위젯       │
│  │  profiles  │  │  │  │  Claude    │  │  │  서버 검증       │
│  │  reports   │  │  │  │  Gemini    │  │  │  웹훅           │
│  │  payments  │  │  │  └────────────┘  │  │                  │
│  │  settings  │  │  │                  │  │                  │
│  └────────────┘  │  │  Multi-AI Router │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

<br>

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| State | Zustand |
| Database | Supabase (PostgreSQL) |
| AI | OpenAI GPT-4o, Claude, Gemini |
| Payment | Toss Payments |
| Analytics | Google Analytics 4 |
| Hosting | Vercel |


