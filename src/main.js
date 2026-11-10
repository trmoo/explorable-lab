/*! 만지는 설명 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  학교 수업 목적으로만 이용해 주세요. 무단 배포·상업적 이용을 금합니다.
 *
 *  정보 · Ⅲ. 알고리즘과 프로그래밍
 *    [12정03-01] 복잡한 문제를 작은 문제로 분해하고 모델링한다 — 설계지(아하·변수·결과)
 *    [12정03-09] 실생활 및 다양한 학문 분야의 문제 해결을 위한 프로그램을 협력적으로 설계·구현한다 — 캔버스 제작·짝 시험
 *
 *  2차시 흐름
 *    1차시 ① 맛보기 → ② 아이디어 고르기 → ③ 설계하기
 *    2차시 ④ 프롬프트·제작(제미나이 캔버스) → ⑤ 짝 시험 → ⑥ 내 활동지
 *
 *  주소 해시로 화면을 가리킬 수 있다 (#taste/dice · #prompt/make).
 */
import './style.css';
import './app.css';
import { h, 화면시작 } from './lib/ui.js';
import { 불러오기, 구독, 지금기록 } from './lib/store.js';
import { 탭들, 진행률, 전체점수 } from './data/activities.js';
import * as 맛보기탭 from './tabs/taste.js';
import * as 고르기탭 from './tabs/pick.js';
import * as 설계탭 from './tabs/design.js';
import * as 프롬프트탭 from './tabs/prompt.js';
import * as 짝탭 from './tabs/test.js';
import * as 활동지탭 from './tabs/report.js';

const 탭모듈 = {
  taste: 맛보기탭, pick: 고르기탭, design: 설계탭,
  prompt: 프롬프트탭, test: 짝탭, report: 활동지탭,
};

불러오기();

const 탭줄 = h('nav', { class: 'tabs', 'aria-label': '큰 갈래' });
const 진행 = h('div', { class: 'progress' });
const 본문 = h('main', { class: 'main' });

document.getElementById('app').append(
  h('header', { class: 'topbar' },
    h('div', { class: 'brand' },
      h('h1', {}, '🖐️ 만지는 설명 실험실'),
      h('span', { class: 'std' }, '익스플로러블 익스플래네이션을 설계하고 제미나이 캔버스로 바이브 코딩하기'),
      진행),
    탭줄),
  본문,
  h('footer', { class: 'footer' },
    h('div', { class: 'cr' }, '© 2026 티쳐무 · 모든 권리 보유'),
    h('div', {}, '학교 수업 목적으로만 이용해 주세요. 무단 배포와 상업적 이용을 금합니다.'),
    h('div', {}, '맛보기 예시의 점수·막대 자료는 수업용으로 지어낸 것입니다. 「익스플로러블 익스플래네이션」은 브렛 빅터(Bret Victor)가 2011년에 제안한 생각입니다.'),
    h('div', {}, '개인정보를 수집하지 않습니다. 활동 기록은 이 브라우저에만 저장되며, 학번·이름은 내려받는 활동지 파일에만 들어갑니다.')),
);

function 주소() {
  const [탭, 하위] = (location.hash || '').replace(/^#/, '').split('/');
  const 모듈 = 탭모듈[탭] ? 탭 : 'taste';
  const 하위들 = 탭모듈[모듈].하위들;
  const 고른하위 = 하위들.find((x) => x.id === 하위) ? 하위 : 하위들[0].id;
  return { 탭: 모듈, 하위: 고른하위 };
}

export function 이동(탭, 하위) {
  const 다음 = '#' + 탭 + (하위 ? '/' + 하위 : '');
  if (location.hash === 다음) 그리기();
  else location.hash = 다음;
}

function 다음자리(탭, 하위) {
  const 하위들 = 탭모듈[탭].하위들;
  const i = 하위들.findIndex((x) => x.id === 하위);
  if (i < 하위들.length - 1) return { 탭, 하위: 하위들[i + 1].id, 이름: 하위들[i + 1].label };
  const j = 탭들.findIndex((t) => t.id === 탭);
  if (j < 탭들.length - 1) {
    const 다음탭 = 탭들[j + 1];
    return { 탭: 다음탭.id, 하위: 탭모듈[다음탭.id].하위들[0].id, 이름: 다음탭.이름 };
  }
  return null;
}

function 진행그리기() {
  const 진 = 진행률(지금기록());
  const 점 = 전체점수(지금기록());
  진행.replaceChildren(
    h('span', { class: 'chip' }, `끝낸 활동 ${진.끝}/${진.전체}`),
    h('span', { class: 'chip' }, `맞힌 문항 ${점.맞음}/${점.전체}`),
  );
}

function 그리기() {
  화면시작();
  const { 탭, 하위 } = 주소();
  탭줄.replaceChildren(...탭들.map((t, i) => [
    (i === 0 || 탭들[i - 1].차시 !== t.차시) && h('span', { class: 'lesson-tag' }, `${t.차시}차시`),
    h('button', {
      class: 'tab' + (t.id === 탭 ? ' on' : ''),
      'aria-current': t.id === 탭 ? 'page' : null,
      onClick: () => 이동(t.id),
    }, t.이름),
  ]).flat().filter(Boolean));

  const 모듈 = 탭모듈[탭];
  const 하위줄 = 모듈.하위들.length > 1
    ? h('div', { class: 'pills' }, 모듈.하위들.map((x) => h('button', {
      class: 'pill' + (x.id === 하위 ? ' on' : ''), onClick: () => 이동(탭, x.id),
    }, x.label)))
    : null;

  const 자리 = h('div', { class: 'screen' });
  const 다음 = 다음자리(탭, 하위);
  본문.replaceChildren(...[
    하위줄,
    자리,
    다음 && h('div', { class: 'next-row' },
      h('button', { class: 'btn primary big', onClick: () => { 이동(다음.탭, 다음.하위); window.scrollTo(0, 0); } }, `다음: ${다음.이름} →`)),
  ].filter(Boolean));
  모듈.그리기(자리, 하위, 이동);
}

구독(진행그리기);
window.addEventListener('hashchange', () => { 그리기(); window.scrollTo(0, 0); });
진행그리기();
그리기();
