/*! 만지는 설명 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  맛보기 예시의 공통 틀 — ① 예측 → ② 조작 → ③ 설명.
 *
 *  ⚠ 조작 판(그림·슬라이더)은 한 번만 만들고 다시 그리지 않는다.
 *    예측·설명이 바뀔 때는 그 둘레의 작은 자리만 다시 그린다(조작하던 상태가 날아가지 않게).
 */
import { h, md, 상자 } from './ui.js';
import { 자료, 자료적기 } from './store.js';
import { 예시들, 눈풀이 } from '../data/explores.js';
import { 글자수, 최소글자 } from '../data/activities.js';

// 조작판만들기(조작함) → 요소. 학생이 처음 무언가를 움직이면 조작함() 을 부른다.
export function 예시틀(키, 조작판만들기) {
  const 예시 = 예시들[키];
  const 열쇠 = 'ex-' + 키;
  const 지금 = () => ({ 예측: null, 조작: false, 설명: '', ...(자료(열쇠) || {}) });
  const 적기 = (바꿀) => 자료적기(열쇠, { ...지금(), ...바꿀 });

  const 예측자리 = h('div', { class: 'choices tight' });
  const 잠금글 = h('div', { class: 'lock-msg' }, '🔒 먼저 위에서 예측을 골라요. 예측해 두어야 결과와 견줄 수 있어요.');
  const 조작함 = () => {
    if (지금().예측 == null || 지금().조작) return;
    적기({ 조작: true });
    예측그리기();
    설명그리기();
  };
  const 판 = 조작판만들기(조작함);
  const 판틀 = h('div', { class: 'sim-wrap' }, 판, 잠금글);
  const 설명셈 = h('span', { class: 'count' });
  const 해설자리 = h('div', {});

  const 예측그리기 = () => {
    const e = 지금();
    // 조작을 시작하면 예측은 굳힌다 — 결과를 보고 예측을 슬쩍 바꾸면 「예측과 달랐다」는 배움이 사라진다.
    const 굳음 = e.조작 && e.예측 != null;
    예측자리.replaceChildren(...[
      ...예시.보기.map((보, i) => h('button', {
        class: 'choice' + (e.예측 === i ? ' chosen' : ''),
        'aria-pressed': e.예측 === i ? 'true' : 'false',
        disabled: 굳음,
        onClick: () => { 적기({ 예측: i }); 예측그리기(); 설명그리기(); },
      }, (e.예측 === i ? '✋ ' : '') + 보)),
      굳음 && h('span', { class: 'muted small' }, '🔒 조작을 시작해서 예측을 굳혔어요'),
    ].filter(Boolean));
    판틀.classList.toggle('locked', e.예측 == null);
  };

  const 설명칸 = h('textarea', {
    rows: 3, value: 지금().설명, 'aria-label': '설명 쓰기',
    placeholder: '예) 나는 ○○라고 예측했는데, 실제로 해 보니 ○○였다. 왜냐하면 …',
    onInput: (e) => { 적기({ 설명: e.target.value }); 설명그리기(); },
  });

  const 설명그리기 = () => {
    const e = 지금();
    const n = 글자수(e.설명);
    설명셈.textContent = `${n}자 / ${최소글자.설명}자 이상`;
    설명셈.className = 'count' + (n >= 최소글자.설명 ? ' ok' : '');
    const 열림 = e.예측 != null && e.조작 && n >= 최소글자.설명;
    if (!열림) {
      const 남은 = [e.예측 == null && '예측 고르기', !e.조작 && '직접 조작해 보기', n < 최소글자.설명 && `설명 ${최소글자.설명}자 이상 쓰기`].filter(Boolean);
      해설자리.replaceChildren(h('p', { class: 'muted' }, `📖 해설은 ${남은.join(' · ')} 뒤에 열려요.`));
      return;
    }
    const 같음 = e.예측 === 예시.실제;
    해설자리.replaceChildren(상자(같음 ? 'tip' : 'now', 같음 ? '🎯 예측이 맞았어요!' : '💡 예측과 달랐어요 — 바로 여기서 배움이 시작돼요',
      h('p', {}, `내 예측: ${예시.보기[e.예측]} · 실제: ${예시.보기[예시.실제]}`),
      h('p', { html: md(예시.해설) })));
  };

  예측그리기();
  설명그리기();

  return h('div', { class: 'explore' },
    h('h2', {}, 예시.제목),
    h('div', { class: 'step-card' },
      h('div', { class: 'step-no' }, '1 예측'),
      h('div', { class: 'step-body' }, h('p', { class: 'q-text', html: md(예시.예측) }), 예측자리)),
    h('div', { class: 'step-card' },
      h('div', { class: 'step-no' }, '2 조작'),
      h('div', { class: 'step-body' }, 판틀)),
    h('div', { class: 'step-card' },
      h('div', { class: 'step-no' }, '3 설명'),
      h('div', { class: 'step-body' },
        h('div', { class: 'field-head' }, h('label', { class: 'field-label' }, 예시.설명물음), 설명셈),
        설명칸, 해설자리)),
    상자('info', '🧑‍💻 이 예시에 숨은 「프로그래머의 눈」',
      h('ul', {}, 예시.눈.map((k) => h('li', {}, 눈풀이[k])))),
  );
}
