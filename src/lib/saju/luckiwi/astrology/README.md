# Astrology Engine (점성학 엔진)

> Swiss Ephemeris 기반 고정밀 천문 계산 엔진

---

## 개요

Swiss Ephemeris(sweph)를 사용한 고정밀 천문 계산 기반의 서양 점성학 분석 엔진입니다.

### 주요 기능
- **네이탈 차트** - 출생 차트 분석
- **시나스트리** - 두 사람 간 궁합 분석
- **솔라 리턴** - 연간 운세 차트
- **피르다리아** - 75년 주기 행성 시기 분석

---

## 폴더 구조

```
astrology/
├── core/                    # 천문 계산 핵심
│   ├── ephemeris.ts         # Swiss Ephemeris 래퍼
│   ├── planets.ts           # 행성 위치 계산
│   ├── houses.ts            # 하우스 계산
│   ├── aspects.ts           # 애스펙트 계산
│   ├── natalChart.ts        # 네이탈 차트 통합
│   ├── synastry.ts          # 시나스트리 계산
│   ├── solarReturn.ts       # 솔라 리턴 계산
│   ├── firdaria.ts          # 피르다리아 계산
│   └── timezone.ts          # 타임존 처리
├── constants/               # 상수 정의
│   ├── signs.ts             # 12궁 사인
│   ├── planets.ts           # 행성 정보
│   ├── houses.ts            # 하우스 정보
│   ├── aspects.ts           # 애스펙트 정보
│   └── rulerships.ts        # 지배성/디그니티
├── interpretation/          # 해석 생성
│   ├── generator.ts         # 해석 생성기
│   └── templates/           # 해석 템플릿 (JSON)
│       ├── planetInSign.json
│       ├── planetInHouse.json
│       └── aspects.json
├── evaluation/              # 품질 평가
│   ├── evaluator.ts         # 룰 기반 평가기
│   ├── aiJudge.ts           # AI 평가 (선택적)
│   ├── types.ts             # 평가 타입
│   └── data/
│       └── dimensions.json  # 8개 평가 차원
└── types/                   # TypeScript 타입
    ├── chart.ts             # 차트 타입
    ├── planets.ts           # 행성 타입
    ├── signs.ts             # 사인 타입
    ├── houses.ts            # 하우스 타입
    ├── aspects.ts           # 애스펙트 타입
    ├── synastry.ts          # 시나스트리 타입
    ├── solarReturn.ts       # 솔라 리턴 타입
    └── firdaria.ts          # 피르다리아 타입
```

---

## 기능 상세

### 네이탈 차트

- **행성 위치**: 태양, 달, 수성, 금성, 화성, 목성, 토성, 천왕성, 해왕성, 명왕성, 카이론, 노드
- **하우스 시스템**: Placidus, Whole Sign, Koch, Equal, Regiomontanus, Campanus, Porphyry
- **애스펙트**: 컨정션, 옵포지션, 트라인, 스퀘어, 섹스타일, 퀸컨스 등
- **모드 지원**: 현대 점성학(외행성 포함) / 고전 점성학(토성까지)
- **디그니티**: 도미사일, 엑잘테이션, 디트리먼트, 폴, 페레그린

### 시나스트리 (궁합)

- **크로스 애스펙트**: 두 차트 간 행성 연결 분석
- **하우스 오버레이**: 상대 하우스에 떨어지는 행성 분석
- **호환성 점수**: 조화/긴장 애스펙트 기반 궁합 점수

### 솔라 리턴 (연간 운세)

- **연간 차트**: 생일 기준 태양 위치 복귀 시점
- **주제 분석**: 해당 연도의 주요 테마 도출
- **하우스 강조**: 활성화되는 삶의 영역 분석

### 피르다리아 (75년 주기)

- **대주기/소주기**: 7개 행성의 75년 주기 분석
- **주야간 구분**: 주간/야간 출생에 따른 시퀀스 차이
- **현재 시기**: 현재 어떤 행성 주기에 있는지 확인

### 해석 생성 + 품질 평가

- **해석 엔진**: 행성-사인-하우스-애스펙트 조합 해석
- **품질 평가**: 룰 기반 8개 차원 평가
  - 천문학적 정확성
  - 해석 일관성
  - 상징 활용
  - 공감
  - 희망
  - 실용성
  - 톤
  - 가독성

---

## API 사용법

### 네이탈 차트

```bash
curl -X POST http://localhost:3000/api/v1/astrology/natal \
  -H "Content-Type: application/json" \
  -d '{
    "year": 1990,
    "month": 5,
    "day": 15,
    "hour": 14,
    "minute": 30,
    "latitude": 37.5665,
    "longitude": 126.9780,
    "timezone": "Asia/Seoul",
    "mode": "modern",
    "houseSystem": "placidus"
  }'
```

### 시나스트리 (궁합)

```bash
curl -X POST http://localhost:3000/api/v1/astrology/synastry \
  -H "Content-Type: application/json" \
  -d '{
    "person1": {
      "year": 1990, "month": 5, "day": 15,
      "hour": 14, "minute": 30,
      "latitude": 37.5665, "longitude": 126.9780,
      "timezone": "Asia/Seoul"
    },
    "person2": {
      "year": 1992, "month": 8, "day": 20,
      "hour": 9, "minute": 15,
      "latitude": 37.5665, "longitude": 126.9780,
      "timezone": "Asia/Seoul"
    }
  }'
```

### 솔라 리턴

```bash
curl -X POST http://localhost:3000/api/v1/astrology/solar-return \
  -H "Content-Type: application/json" \
  -d '{
    "birthData": {
      "year": 1990, "month": 5, "day": 15,
      "hour": 14, "minute": 30,
      "latitude": 37.5665, "longitude": 126.9780,
      "timezone": "Asia/Seoul"
    },
    "returnYear": 2026
  }'
```

### 피르다리아

```bash
curl -X POST http://localhost:3000/api/v1/astrology/firdaria \
  -H "Content-Type: application/json" \
  -d '{
    "year": 1990,
    "month": 5,
    "day": 15,
    "hour": 14,
    "minute": 30,
    "latitude": 37.5665,
    "longitude": 126.9780,
    "timezone": "Asia/Seoul"
  }'
```

---

## 기술 스택

- **천문 계산**: [sweph](https://www.npmjs.com/package/sweph) (Swiss Ephemeris Node.js 바인딩)
- **타임존**: date-fns-tz
- **언어**: TypeScript

---

## 테스트

```bash
# 점성학 테스트만 실행
npm test -- --grep astrology

# 전체 테스트 (33개 점성학 테스트 포함)
npm test
```
