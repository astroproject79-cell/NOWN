'use client';

import { useStore } from '@/lib/store';
import { themes } from '@/lib/theme';

interface FourPillarsData {
  year: { stem: string; branch: string };
  month: { stem: string; branch: string };
  day: { stem: string; branch: string };
  hour: { stem: string; branch: string };
}

interface ManseTableProps {
  fourPillars: FourPillarsData;
  fiveElements?: Record<string, number>;
}

var STEM_HANJA: Record<string, string> = {
  '갑': '甲', '을': '乙', '병': '丙', '정': '丁', '무': '戊',
  '기': '己', '경': '庚', '신': '辛', '임': '壬', '계': '癸',
};

var BRANCH_HANJA: Record<string, string> = {
  '자': '子', '축': '丑', '인': '寅', '묘': '卯', '진': '辰', '사': '巳',
  '오': '午', '미': '未', '신': '申', '유': '酉', '술': '戌', '해': '亥',
};

var STEM_ELEMENT: Record<string, string> = {
  '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
  '기': '토', '경': '금', '신': '금', '임': '수', '계': '수',
};

var BRANCH_ELEMENT: Record<string, string> = {
  '자': '수', '축': '토', '인': '목', '묘': '목', '진': '토', '사': '화',
  '오': '화', '미': '토', '신': '금', '유': '금', '술': '토', '해': '수',
};

var ELEMENT_COLORS: Record<string, string> = {
  '목': '#4ade80',
  '화': '#f87171',
  '토': '#fbbf24',
  '금': '#e2e8f0',
  '수': '#60a5fa',
};

var ELEMENT_LABELS: Record<string, string> = {
  '목': '木',
  '화': '火',
  '토': '土',
  '금': '金',
  '수': '水',
};

export default function ManseTable({ fourPillars, fiveElements }: ManseTableProps) {
  var store = useStore();
  var t = themes[store.theme];
  var accentRgba = t.pColor1.join(',');

  var pillars = [
    { label: '시주', data: fourPillars.hour },
    { label: '일주', data: fourPillars.day },
    { label: '월주', data: fourPillars.month },
    { label: '년주', data: fourPillars.year },
  ];

  return (
    <div style={{
      background: t.fog + '0.4)',
      border: '1px solid rgba(' + accentRgba + ',0.08)',
      borderRadius: 12,
      padding: '16px 12px',
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
        {pillars.map(function(p, i) {
          var stemEl = STEM_ELEMENT[p.data.stem] || '';
          var branchEl = BRANCH_ELEMENT[p.data.branch] || '';
          var stemColor = ELEMENT_COLORS[stemEl] || t.text;
          var branchColor = ELEMENT_COLORS[branchEl] || t.text;
          var stemHanja = STEM_HANJA[p.data.stem] || p.data.stem;
          var branchHanja = BRANCH_HANJA[p.data.branch] || p.data.branch;

          return (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 56,
            }}>
              <span style={{ fontSize: 10, color: t.dim, marginBottom: 6 }}>{p.label}</span>
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 8,
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}>
                <span style={{ fontSize: 18, fontWeight: 500, color: stemColor }}>{stemHanja}</span>
                <span style={{ fontSize: 18, fontWeight: 500, color: branchColor }}>{branchHanja}</span>
              </div>
              <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                <span style={{ fontSize: 9, color: stemColor }}>{ELEMENT_LABELS[stemEl]}</span>
                <span style={{ fontSize: 9, color: branchColor }}>{ELEMENT_LABELS[branchEl]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {fiveElements && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
          paddingTop: 12,
          borderTop: '1px solid rgba(' + accentRgba + ',0.06)',
        }}>
          {['목', '화', '토', '금', '수'].map(function(el) {
            var count = fiveElements[el] || 0;
            var color = ELEMENT_COLORS[el];
            return (
              <div key={el} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 11, color: color }}>{ELEMENT_LABELS[el]}</span>
                <span style={{ fontSize: 11, color: t.dim }}>{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
