'use client';

import { useStore } from '@/lib/store';
import { themes } from '@/lib/theme';
import Header from '@/components/ui/Header';

var SECTIONS = [
  {
    title: '제1조 (개인정보의 처리목적)',
    body: [
      '회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.',
      '',
      '서비스 제공: 사주/점성학 분석 결과 제공, 운세 리포트 생성, 맞춤형 콘텐츠 추천',
      '서비스 개선 및 신규 서비스 개발: 접속 빈도 파악, 회원의 서비스 이용에 대한 통계, AI 알고리즘 고도화를 위한 학습 데이터 활용 (비식별 처리 후)',
    ],
  },
  {
    title: '제2조 (처리하는 개인정보 항목)',
    body: [
      '회사는 서비스 제공을 위해 아래와 같은 정보를 수집합니다.',
      '',
      '필수항목: 생년월일, 태어난 시간, 성별, 태어난 장소 (이름은 수집하지 않거나 닉네임으로 대체)',
      '자동수집항목: IP주소, 쿠키(Cookie), 접속 로그, 서비스 이용 기록, 기기 정보',
    ],
  },
  {
    title: '제3조 (개인정보의 처리 및 보유기간)',
    body: [
      '① 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.',
      '',
      '② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.',
      '비회원 정보: 브라우저 종료 시 또는 결과 페이지 이탈 시 즉시 파기 (단, 서비스 부정 이용 방지를 위해 접속 로그는 3개월간 보관)',
      '회원 정보(추후 도입 시): 회원 탈퇴 시까지',
    ],
  },
  {
    title: '제4조 (개인정보의 제3자 제공)',
    body: [
      '회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.',
    ],
  },
  {
    title: '제5조 (개인정보의 파기)',
    body: [
      '① 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때는 지체 없이 해당 개인정보를 파기합니다.',
      '',
      '② 파기절차 및 방법: 전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없도록 파기하며, 종이 문서의 경우 분쇄하거나 소각하여 파기합니다.',
    ],
  },
  {
    title: '제6조 (개인정보 보호책임자)',
    body: [
      '회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.',
      '',
      '성명: 나운(NOWN)',
      '직책: 개인정보 담당부서',
      '소속: 나운(NOWN) 운영팀',
      '연락처: astro.project79@gmail.com',
    ],
  },
  {
    title: '제7조 (개인정보 처리방침 변경)',
    body: [
      '이 개인정보 처리방침은 2026. 02. 05부터 적용됩니다.',
    ],
  },
];

export default function PrivacyPage() {
  var store = useStore();
  var t = themes[store.theme];
  var accentRgba = t.pColor1.join(',');

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <Header />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 120px' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: 'rgba(' + accentRgba + ',0.5)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            Privacy Policy
          </p>
          <h1 style={{
            fontFamily: "'ZEN SERIF TTF',sans-serif",
            fontSize: 28,
            color: t.text,
            fontWeight: 400,
            marginBottom: 12,
            lineHeight: 1.4,
          }}>
            개인정보처리방침
          </h1>
          <p style={{ fontSize: 14, color: t.dim, lineHeight: 1.8 }}>
            나운(NOWN)(이하 &apos;회사&apos;라 함)은(는) 개인정보보호법 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
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
