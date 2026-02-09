'use client';

import { useStore } from '@/lib/store';
import { themes } from '@/lib/theme';
import Header from '@/components/ui/Header';

var SECTIONS = [
  {
    title: '제1조 (목적)',
    body: [
      '본 약관은 나운(NOWN)(이하 "회사"라 함)이 운영하는 사주/심리 분석 웹 서비스 나운(NOWN)(이하 "서비스"라 함)을 이용함에 있어 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.',
    ],
  },
  {
    title: '제2조 (용어의 정의)',
    body: [
      '1. "서비스"란 단말기에 상관없이 회원이 이용할 수 있는 나운(NOWN) 및 관련 제반 서비스를 의미합니다.',
      '',
      '2. "AI 분석 리포트"란 회사가 회원의 데이터를 바탕으로 AI 알고리즘을 통해 생성하여 제공하는 디지털 콘텐츠를 말합니다.',
    ],
  },
  {
    title: '제3조 (약관의 명시와 개정)',
    body: [
      '회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시하며, 관련 법을 위배하지 않는 범위에서 개정할 수 있습니다.',
    ],
  },
  {
    title: '제4조 (서비스의 특수성 고지)',
    body: [
      '본 서비스가 제공하는 운세 및 심리 분석 결과는 생성형 AI 기술과 통계적 이론에 근거하나 미래에 대한 확정적 예언이나 의학적 진단이 아닙니다.',
      '',
      '회사는 결과의 신뢰성에 대해 보증하지 않으며, 이를 활용한 회원의 최종 결정에 대한 책임은 회원 본인에게 있습니다.',
    ],
  },
  {
    title: '제5조 (이용요금 및 결제)',
    body: [
      '유료 서비스의 이용요금 결제는 회사가 제공하는 결제 수단을 통하여 이루어집니다.',
    ],
  },
  {
    title: '제6조 (청약철회 및 환불 등)',
    body: [
      '[청약철회 제한]',
      '',
      '회사가 제공하는 \'AI 분석 리포트\'는 구매 즉시 열람 가능한 \'디지털 콘텐츠\'로서, 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 콘텐츠 제공(열람, 화면 출력 등)이 개시된 경우 환불이 제한됩니다.',
      '',
      '단, 시스템 오류로 리포트가 생성되지 않은 경우는 제외합니다.',
    ],
  },
  {
    title: '제7조 (회원의 의무)',
    body: [
      '회원은 타인의 정보를 도용하거나 회사의 정보를 영리 목적으로 무단 복제·배포하여서는 안 됩니다.',
    ],
  },
  {
    title: '제8조 (면책조항)',
    body: [
      '회사는 천재지변, 회원의 귀책 사유로 인한 서비스 장애, 회원이 서비스를 통해 기대하는 수익을 얻지 못한 것에 대하여 책임을 지지 않습니다.',
    ],
  },
  {
    title: '제9조 (저작권의 귀속)',
    body: [
      '회사가 작성한 저작물에 대한 저작권은 회사에 귀속합니다.',
    ],
  },
  {
    title: '제10조 (분쟁해결 및 문의)',
    body: [
      '1. 회사는 이용자의 정당한 의견이나 불만을 처리하기 위하여 온라인 고객 상담 채널(카카오톡 채널, 이메일 등)을 운영합니다.',
      '',
      '2. 회사는 접수된 문의사항을 신속하게 처리하도록 노력하며, 즉시 처리가 곤란한 경우 그 사유와 일정을 안내합니다.',
      '',
      '3. 회사와 이용자 간에 발생한 전자상거래 분쟁과 관련하여 이용자의 피해구제신청이 있는 경우에는 공정거래위원회 또는 시·도지사가 의뢰하는 분쟁조정기관의 조정에 따를 수 있습니다.',
    ],
  },
  {
    title: '부칙',
    body: [
      '본 약관은 2026년 2월 7일부터 시행합니다.',
    ],
  },
];

export default function TermsPage() {
  var store = useStore();
  var t = themes[store.theme];
  var accentRgba = t.pColor1.join(',');

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <Header />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 120px' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: 'rgba(' + accentRgba + ',0.5)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            Terms of Service
          </p>
          <h1 style={{
            fontFamily: "'Pretendard',sans-serif",
            fontSize: 26,
            color: t.text,
            fontWeight: 600,
            marginBottom: 12,
            lineHeight: 1.4,
          }}>
            서비스 이용약관
          </h1>
          <p style={{ fontSize: 14, color: t.dim, lineHeight: 1.8 }}>
            나운(NOWN) 서비스를 이용해 주셔서 감사합니다. 본 약관은 서비스 이용에 관한 기본적인 사항을 규정합니다.
          </p>
        </div>

        {SECTIONS.map(function(section, idx) {
          return (
            <div key={idx} style={{ marginBottom: 36 }}>
              <h2 style={{
                fontSize: 15,
                color: t.text,
                fontWeight: 600,
                marginBottom: 14,
                fontFamily: "'Pretendard',sans-serif",
              }}>
                {section.title}
              </h2>
              <div style={{
                padding: '20px 24px',
                background: t.fog + '0.25)',
                border: '1px solid rgba(' + accentRgba + ',0.06)',
                borderRadius: 10,
              }}>
                {section.body.map(function(line, li) {
                  if (line === '') return <div key={li} style={{ height: 10 }} />;
                  return (
                    <p key={li} style={{
                      fontSize: 13.5,
                      color: t.dim,
                      lineHeight: 1.9,
                      marginBottom: li < section.body.length - 1 ? 4 : 0,
                    }}>
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div style={{
          marginTop: 60,
          paddingTop: 24,
          borderTop: '1px solid rgba(' + accentRgba + ',0.06)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 11, color: t.dim, opacity: 0.4 }}>
            나운(NOWN) · astro.project79@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
