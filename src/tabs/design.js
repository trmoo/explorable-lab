/*! 만지는 설명 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  ③ 설계하기 — 종이 설계지와 같은 칸. 채우는 대로 자기 점검 뱃지가 켜진다.
 *
 *  ⚠ 입력 칸은 다시 그리지 않는다(쓰는 도중에 커서가 날아가지 않게). 점검 뱃지 자리만 다시 그린다.
 *    변수 줄을 더하거나 뺄 때만 변수 칸 묶음을 다시 그린다.
 */
import { h, md, 상자, 접이 } from '../lib/ui.js';
import { 자료, 자료적기 } from '../lib/store.js';
import { 빈설계, 설계점검, 기술들, 대상들 } from '../engine/design.js';

export const 하위들 = [{ id: 'main', label: '설계하기' }];

const 예시설계 = {
  과목: '수학 · 확률', 주제: '생일이 같은 사람이 있을 확률(생일 문제)', 대상: '고등학생',
  아하: '사람 수가 23명만 되어도 생일이 같은 사람이 있을 확률이 절반을 넘는다.',
  예측: '한 반에 몇 명이 모이면 생일이 같은 사람이 있을 확률이 50%를 넘을까?',
  변수: [{ 이름: '사람 수', 최소: '2', 최대: '60', 기본: '10', 단위: '명' }],
  화면: '왼쪽에 사람 수만큼 생일 달력 점, 오른쪽에 사람 수에 따른 확률 꺾은선 그래프',
  결과: '확률 숫자와 그래프 위 현재 위치 점이 바뀌고, 생일이 같은 두 사람이 있으면 선으로 이어 준다',
  기술: 'canvas',
};

export function 그리기(자리) {
  const d = { ...빈설계(), ...(자료('design') || {}) };
  if (!Array.isArray(d.변수) || !d.변수.length) d.변수 = 빈설계().변수;
  const 저장 = () => { 자료적기('design', JSON.parse(JSON.stringify(d))); 점검그리기(); };

  const 점검자리 = h('div', { class: 'check-list' });
  const 점검그리기 = () => {
    const 목록 = 설계점검(d);
    const 꼭 = 목록.filter((c) => c.꼭);
    const 된 = 꼭.filter((c) => c.ok).length;
    점검자리.replaceChildren(
      h('div', { class: 'check-head' }, `자기 점검 ${된} / ${꼭.length}`, 된 === 꼭.length && h('span', { class: 'ok-tag' }, ' ✅ 설계 완료!')),
      ...목록.map((c) => h('div', { class: 'check-item' + (c.ok ? ' ok' : '') + (c.꼭 ? '' : ' soft') },
        h('span', { class: 'check-mark' }, c.ok ? '✅' : c.꼭 ? '⬜' : '💭'),
        h('span', {}, c.글, !c.ok && c.고칠 && h('small', { class: 'check-fix' }, ` — ${c.고칠}`)))),
    );
  };

  const 칸 = (열쇠, 이름, 도움, { 여러줄 = false, 예 = '' } = {}) => h('div', { class: 'field' },
    h('label', { class: 'field-label' }, 이름, 도움 && h('small', { class: 'muted' }, ` — ${도움}`)),
    h(여러줄 ? 'textarea' : 'input', {
      type: 여러줄 ? null : 'text', rows: 여러줄 ? 2 : null, value: d[열쇠] || '', placeholder: 예,
      'aria-label': 이름,
      onInput: (e) => { d[열쇠] = e.target.value; 저장(); },
    }));

  // ── 변수 줄 ──
  const 변수자리 = h('div', { class: 'var-rows' });
  const 변수그리기 = () => {
    변수자리.replaceChildren(
      h('div', { class: 'var-row var-head' }, h('span', {}, '변수 이름'), h('span', {}, '최솟값'), h('span', {}, '최댓값'), h('span', {}, '처음 값'), h('span', {}, '단위'), h('span', {})),
      ...d.변수.map((v, i) => h('div', { class: 'var-row' },
        ...['이름', '최소', '최대', '기본', '단위'].map((k) => h('input', {
          type: 'text', value: v[k] ?? '', inputmode: ['최소', '최대', '기본'].includes(k) ? 'decimal' : null,
          placeholder: { 이름: '예) 학습률', 최소: '0.01', 최대: '1', 기본: '0.1', 단위: '(없으면 비움)' }[k],
          'aria-label': `${i + 1}번째 변수 ${k}`,
          onInput: (e) => { v[k] = e.target.value; 저장(); },
        })),
        h('button', { class: 'btn small ghost', disabled: d.변수.length <= 1, 'aria-label': `${i + 1}번째 변수 빼기`,
          onClick: () => { d.변수.splice(i, 1); 저장(); 변수그리기(); } }, '✕'))),
      h('button', { class: 'btn small', disabled: d.변수.length >= 4,
        onClick: () => { d.변수.push({ 이름: '', 최소: '', 최대: '', 기본: '', 단위: '' }); 저장(); 변수그리기(); } }, '＋ 변수 더하기'),
    );
  };
  변수그리기();

  // ── 기술·대상 고르기 ──
  const 기술줄 = h('div', { class: 'tech-grid' });
  const 기술그리기 = () => 기술줄.replaceChildren(...기술들.map((t) => h('button', {
    class: 'tech-btn' + (d.기술 === t.id ? ' on' : ''), 'aria-pressed': d.기술 === t.id ? 'true' : 'false',
    onClick: () => { d.기술 = t.id; 저장(); 기술그리기(); },
  }, h('b', {}, t.이름), h('small', {}, t.설명))));
  기술그리기();
  const 대상칸 = h('select', { class: 'select', 'aria-label': '대상', onChange: (e) => { d.대상 = e.target.value; 저장(); } },
    ...대상들.map((x) => h('option', { value: x, selected: d.대상 === x ? true : null }, x)));

  점검그리기();
  자리.append(
    h('h2', {}, '나의 만지는 설명 설계하기'),
    h('p', { class: 'lead', html: md('종이 설계지에 먼저 생각해 두었다면 그대로 옮겨 적으세요. 여기 적은 내용이 **다음 탭에서 프롬프트로 자동 조립**됩니다.') }),
    h('div', { class: 'design-layout' },
      h('div', { class: 'card' },
        h('h3', {}, '1. 무엇을 보여 줄까'),
        칸('과목', '과목·단원', '어느 시간에 배우는 내용인가', { 예: '예) 수학 · 확률' }),
        칸('주제', '주제', '어떤 개념인가', { 예: '예) 생일이 같은 사람이 있을 확률' }),
        h('div', { class: 'field' }, h('label', { class: 'field-label' }, '누가 쓰나 (대상)'), 대상칸),
        h('h3', { class: 'sec' }, '2. 「아하!」와 예측 질문'),
        칸('아하', '「아하!」 한 문장', '학생이 깨닫기를 바라는 것', { 여러줄: true, 예: '예) 사람 수가 23명만 되어도 확률이 절반을 넘는다.' }),
        칸('예측', '먼저 던질 예측 질문', '「~하면 어떻게 될까?」', { 예: '예) 몇 명이 모이면 확률이 50%를 넘을까?' }),
        h('h3', { class: 'sec' }, '3. 바꿀 변수 (1~3개)'),
        변수자리,
        h('h3', { class: 'sec' }, '4. 화면과 결과'),
        칸('화면', '화면에 무엇이 보이나', '그림·그래프·숫자의 자리', { 여러줄: true, 예: '예) 왼쪽에 달력 점, 오른쪽에 확률 꺾은선 그래프' }),
        칸('결과', '값을 바꾸면 무엇이 변하나', '피드백', { 여러줄: true, 예: '예) 확률 숫자와 그래프 위 점이 바뀌고, 생일이 같은 두 사람을 선으로 잇는다' }),
        h('h3', { class: 'sec' }, '5. 만드는 도구'),
        기술줄),
      h('div', { class: 'design-side' },
        h('div', { class: 'card sticky' }, 점검자리),
        접이('📝 완성 예시 보기 (베끼지 말고 모양만 참고)',
          h('table', { class: 'tbl' }, h('tbody', {},
            ['과목', '주제', '대상', '아하', '예측', '화면', '결과'].map((k) => h('tr', {}, h('th', {}, k), h('td', {}, 예시설계[k]))),
            h('tr', {}, h('th', {}, '변수'), h('td', {}, 예시설계.변수.map((v) => `${v.이름} ${v.최소}~${v.최대}${v.단위} (처음 ${v.기본}${v.단위})`).join(', '))),
          ))),
        상자('tip', '💡 막힐 때',
          h('ul', {},
            h('li', {}, '친구들이 자주 헷갈리는 개념 하나를 떠올려요.'),
            h('li', {}, '「이 값을 바꿔 보면 바로 알 텐데」 싶은 값이 변수예요.'),
            h('li', {}, '아하 문장에 변수 이름을 넣어 보세요. 「○○를 바꾸면 ○○가 된다」.'))))),
  );
}
