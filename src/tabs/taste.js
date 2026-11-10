/*! 만지는 설명 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  ① 맛보기 — 만지는 설명이란 · 주사위 · 평균과 중앙값 · 정렬 비교.
 *
 *  예시 셋은 학생이 나중에 만들 앱의 「잘 만든 본보기」다.
 *  그래서 [처음으로] · 시드 · 경계값 안내 · 한 단계씩 같은 「프로그래머의 눈」을 일부러 갖춰 두었다.
 */
import { h, s, md, 상자, 화면타이머 } from '../lib/ui.js';
import { 문항목록 } from '../lib/quiz.js';
import { 예시틀 } from '../lib/explore.js';
import {
  시드난수, 주사위한번, 기댓값, 주사위요약, 조작무게,
  평균, 중앙값, 회귀선, 기본점들,
  정렬방법들, 배열모양들, 배열만들기, 정렬걸음, 일년시간,
} from '../engine/sims.js';

export const 하위들 = [
  { id: 'intro', label: '만지는 설명이란?' },
  { id: 'dice', label: '🎲 주사위' },
  { id: 'reg', label: '📈 평균과 중앙값' },
  { id: 'sort', label: '🔢 정렬 비교' },
];

export function 그리기(자리, 하위) {
  if (하위 === 'dice') 자리.append(예시틀('dice', 주사위판));
  else if (하위 === 'reg') 자리.append(예시틀('reg', 회귀판));
  else if (하위 === 'sort') 자리.append(예시틀('sort', 정렬판));
  else 소개(자리);
}

const 반올림 = (x, n = 2) => (x == null || !isFinite(x) ? '—' : (Math.round(x * 10 ** n) / 10 ** n).toLocaleString('ko-KR'));

// ───────────────────────────── 만지는 설명이란 ─────────────────────────────
function 소개(자리) {
  // 반응하는 문서 — 숫자를 끌면 문장의 결론이 바뀐다
  let 분 = 30;
  const 숫자 = h('span', { class: 'drag-num', tabindex: '0', role: 'slider', 'aria-valuemin': '5', 'aria-valuemax': '180', 'aria-label': '하루 공부 시간(분)' });
  const 시간 = h('b', { class: 'react-out' });
  const 날 = h('b', { class: 'react-out' });
  const 새로 = () => {
    분 = Math.max(5, Math.min(180, 분));
    숫자.textContent = `${분}분`;
    숫자.setAttribute('aria-valuenow', String(분));
    const 시 = 일년시간(분);
    시간.textContent = `${시.toLocaleString('ko-KR')}시간`;
    날.textContent = `${반올림(시 / 24, 1)}일`;
  };
  let 시작x = null, 시작분 = 분;
  숫자.addEventListener('pointerdown', (e) => { 시작x = e.clientX; 시작분 = 분; 숫자.setPointerCapture(e.pointerId); 숫자.classList.add('dragging'); });
  숫자.addEventListener('pointermove', (e) => { if (시작x == null) return; 분 = 시작분 + Math.round((e.clientX - 시작x) / 8) * 5; 새로(); });
  const 놓기 = () => { 시작x = null; 숫자.classList.remove('dragging'); };
  숫자.addEventListener('pointerup', 놓기);
  숫자.addEventListener('pointercancel', 놓기);
  숫자.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { 분 += 5; 새로(); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { 분 -= 5; 새로(); e.preventDefault(); }
  });
  새로();

  const 낱말 = (글, 뜻) => h('span', { class: 'term', tabindex: '0', 'data-tip': 뜻 }, 글);

  자리.append(
    h('h2', {}, '만지는 설명(익스플로러블 익스플래네이션)이란?'),
    h('p', { class: 'lead', html: md('읽는 사람이 **값을 바꾸며 스스로 원리를 발견하는** 인터랙티브 설명입니다. 「이 값이 바뀌면?」을 상상하는 대신 **직접 확인**하게 합니다.') }),
    h('div', { class: 'two' },
      h('div', { class: 'card read-card' },
        h('h3', {}, '📄 읽는 설명'),
        h('p', {}, '하루에 30분씩 공부하면 1년이면 약 183시간, 하루 24시간으로 치면 약 7.6일이 됩니다.'),
        h('p', { class: 'muted' }, '→ 「그렇구나」 하고 지나갑니다. 10분이면? 2시간이면? 궁금해도 확인할 수 없어요.')),
      h('div', { class: 'card touch-card' },
        h('h3', {}, '🖐️ 만지는 설명'),
        h('p', { class: 'react-line' }, '하루에 ', 숫자, '씩 공부하면 1년이면 약 ', 시간, ', 하루 24시간으로 치면 약 ', 날, '이 됩니다.'),
        h('p', { class: 'muted' }, '👆 파란 숫자를 좌우로 끌어 보세요. (키보드 ← → 도 돼요)'))),
    h('h3', { class: 'sec' }, '세 가지 핵심 아이디어'),
    h('div', { class: 'idea-grid' },
      h('div', { class: 'card' }, h('h4', {}, '① 반응하는 문서'), h('p', {}, '글 속 숫자를 바꾸면 결론도 바뀐다. (위의 파란 숫자처럼)')),
      h('div', { class: 'card' }, h('h4', {}, '② 탐구할 수 있는 예시'), h('p', {}, '입력을 바꿔 가며 여러 경우를 직접 확인한다. (다음 화면의 주사위·점·막대)')),
      h('div', { class: 'card' }, h('h4', {}, '③ 맥락 속 정보'),
        h('p', {}, '낯선 개념을 그 자리에서 확인한다. 예) 주사위 눈의 ', 낱말('기댓값', '여러 번 던졌을 때 평균이 다가가는 값. 주사위는 (1+2+3+4+5+6)÷6 = 3.5'), '은 3.5입니다.'),
        h('p', { class: 'muted small' }, '👆 밑줄 친 낱말에 마우스를 올리거나 눌러 보세요.'))),
    상자('now', '🔁 수업에서 쓰는 순서 — 예측 → 조작 → 설명',
      h('div', { class: 'flow3' },
        h('div', {}, h('b', {}, '1. 예측'), h('span', {}, '「이렇게 될 거야」를 먼저 정한다')),
        h('div', {}, h('b', {}, '2. 조작'), h('span', {}, '값을 바꿔 보며 확인한다')),
        h('div', {}, h('b', {}, '3. 설명'), h('span', {}, '예측과 같았나, 왜 달랐나를 말한다'))),
      h('p', {}, '예측이 빗나간 순간 「어? 왜지?」가 생기고, 그때 배움이 시작됩니다. 이 앱의 맛보기 셋도 이 순서로 되어 있어요.')),
    h('details', { class: 'more' },
      h('summary', {}, '🌍 세상의 대표 사례 (집에서 열어 보세요)'),
      h('div', { class: 'more-body' },
        h('table', { class: 'tbl' },
          h('thead', {}, h('tr', {}, h('th', {}, '사례'), h('th', {}, '만든 사람'), h('th', {}, '내용'))),
          h('tbody', {}, [
            ['Parable of the Polygons', 'https://ncase.me/polygons/', '비 하트, 니키 케이스', '작은 편견이 큰 분리를 만드는 과정'],
            ['The Evolution of Trust', 'https://ncase.me/trust/', '니키 케이스', '게임 이론으로 본 신뢰의 진화'],
            ['Red Blob Games', 'https://www.redblobgames.com/', '아밋 파텔', '경로 탐색 등 게임 알고리즘'],
            ['Seeing Theory', 'https://seeing-theory.brown.edu/', '브라운 대학교', '확률과 통계 기초'],
            ['TensorFlow Playground', 'https://playground.tensorflow.org/', '구글', '신경망의 학습 과정'],
            ['explorabl.es', 'https://explorabl.es/', '커뮤니티', '분야별 사례 모음'],
          ].map(([이름, 주소, 누구, 내용]) => h('tr', {},
            h('td', {}, h('a', { href: 주소, target: '_blank', rel: 'noopener' }, 이름)),
            h('td', {}, 누구), h('td', {}, 내용))))),
        h('p', { class: 'muted small' }, '바깥 사이트는 영어이고 인터넷이 필요합니다.'))),
    h('h3', { class: 'sec' }, '확인 문제'),
    문항목록('taste-intro'),
  );
}

// ───────────────────────────── 🎲 주사위 ─────────────────────────────
const 최대던짐 = 100000;

function 주사위판(조작함) {
  let 시드 = 2026;
  let 조작 = false;
  let rng = 시드난수(시드);
  let 던짐 = [];
  let 실험 = null;   // { 횟수, 평균들 }

  const 판 = h('div', { class: 'sim' });
  const 통계 = h('div', { class: 'stat-row' });
  const 막대자리 = h('div', { class: 'chart' });
  const 선자리 = h('div', { class: 'chart' });
  const 실험자리 = h('div', {});
  const 안내 = h('div', { class: 'sim-note' });

  const 처음으로 = (글) => {
    rng = 시드난수(시드);
    던짐 = [];
    실험 = null;
    새로();
    if (글) 안내.textContent = 글;
  };

  const 던지기 = (n) => {
    조작함();
    if (던짐.length + n > 최대던짐) { 안내.textContent = `⚠ 최대 ${최대던짐.toLocaleString('ko-KR')}번까지만 던질 수 있어요. [처음으로] 를 눌러 다시 시작해요.`; return; }
    for (let i = 0; i < n; i++) 던짐.push(주사위한번(rng, 조작));
    안내.textContent = '';
    새로();
  };

  const 실험하기 = (횟수) => {
    조작함();
    const 평균들 = [];
    for (let k = 0; k < 20; k++) {
      let 합 = 0;
      for (let i = 0; i < 횟수; i++) 합 += 주사위한번(rng, 조작);
      평균들.push(합 / 횟수);
    }
    실험 = { 횟수, 평균들 };
    실험그리기();
  };

  const 시드칸 = h('input', { type: 'number', class: 'seed-input', value: 시드, min: 1, 'aria-label': '시드 번호',
    onChange: (e) => { 시드 = Math.max(1, Math.floor(Number(e.target.value) || 1)); e.target.value = 시드; 조작함(); 처음으로(`시드 ${시드}번으로 처음부터 다시 시작했어요. 같은 번호면 언제나 같은 결과가 나와요.`); } });
  const 조작칸 = h('input', { type: 'checkbox', 'aria-label': '조작된 주사위',
    onChange: (e) => { 조작 = e.target.checked; 조작함(); 처음으로(조작 ? '🎭 조작된 주사위 — 6이 다른 눈보다 3배 잘 나와요. 처음부터 다시 시작했어요.' : '공정한 주사위로 처음부터 다시 시작했어요.'); } });

  function 새로() {
    const 요 = 주사위요약(던짐);
    const 기대 = 기댓값(조작);
    통계.replaceChildren(
      h('div', { class: 'stat' }, h('span', {}, '던진 횟수'), h('b', {}, 요.n.toLocaleString('ko-KR') + '번')),
      h('div', { class: 'stat' }, h('span', {}, '눈의 평균'), h('b', {}, 요.n ? 반올림(요.평균, 3) : '—')),
      h('div', { class: 'stat' }, h('span', {}, '기댓값'), h('b', {}, 반올림(기대, 3))),
      h('div', { class: 'stat' }, h('span', {}, '기댓값과 차이'), h('b', {}, 요.n ? 반올림(Math.abs(요.평균 - 기대), 3) : '—')),
    );
    막대자리.replaceChildren(막대그림(요, 조작));
    선자리.replaceChildren(요.n ? 누적그림(요, 기대) : h('div', { class: 'empty-chart' }, '아직 던지지 않았어요. 위의 단추로 던져 보세요.'));
  }

  function 실험그리기() {
    if (!실험) { 실험자리.replaceChildren(); return; }
    const 안 = 실험.평균들.filter((m) => m >= 3.4 - 1e-9 && m <= 3.6 + 1e-9).length;
    실험자리.replaceChildren(
      h('p', { html: md(`**${실험.횟수.toLocaleString('ko-KR')}번 던지기**를 20번 되풀이한 평균들 — 3.4~3.6 안에 든 것은 **20번 중 ${안}번**`) }),
      점줄그림(실험.평균들));
  }

  새로();
  판.append(
    h('div', { class: 'row wrap' },
      ...[1, 10, 100, 1000].map((n) => h('button', { class: 'btn primary', onClick: () => 던지기(n) }, `🎲 ${n.toLocaleString('ko-KR')}번 던지기`)),
      h('button', { class: 'btn', onClick: () => { 조작함(); 처음으로('처음 상태로 돌아왔어요.'); } }, '⏮ 처음으로')),
    h('div', { class: 'row wrap' },
      h('label', { class: 'switch-label' }, 조작칸, ' 🎭 조작된 주사위 (6이 3배 잘 나옴)'),
      h('label', { class: 'switch-label' }, '🌱 시드 ', 시드칸)),
    안내,
    통계,
    h('div', { class: 'two' }, h('div', {}, h('h4', {}, '눈마다 나온 비율'), 막대자리), h('div', {}, h('h4', {}, '던질수록 평균은?'), 선자리)),
    h('div', { class: 'card inner' },
      h('h4', {}, '🔁 같은 실험을 20번 되풀이하면?'),
      h('p', { class: 'muted' }, '예측 문제를 확인하는 가장 확실한 방법이에요. 10번 던지기를 20번 해 본 평균들과, 1,000번 던지기를 20번 해 본 평균들을 견줘 보세요.'),
      h('div', { class: 'row wrap' },
        h('button', { class: 'btn', onClick: () => 실험하기(10) }, '10번 던지기 × 20번'),
        h('button', { class: 'btn', onClick: () => 실험하기(1000) }, '1,000번 던지기 × 20번')),
      실험자리),
  );
  return 판;
}

function 막대그림(요, 조작) {
  const W = 420, H = 230, 왼 = 40, 아래 = 40, 위 = 16;
  const 높이 = H - 아래 - 위;
  const 최대 = 0.5;
  const y = (p) => 위 + 높이 * (1 - Math.min(p, 최대) / 최대);
  const 칸 = (W - 왼 - 10) / 6;
  const 합 = 조작무게.reduce((a, b) => a + b, 0);
  return s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'svg-chart', role: 'img', 'aria-label': '눈마다 나온 비율 막대그래프' },
    [0, 0.1, 0.2, 0.3, 0.4, 0.5].map((p) => [
      s('line', { x1: 왼, x2: W - 10, y1: y(p), y2: y(p), class: 'grid' }),
      s('text', { x: 왼 - 6, y: y(p) + 4, class: 'tick', 'text-anchor': 'end' }, `${Math.round(p * 100)}%`),
    ]),
    요.상대도수.map((p, i) => {
      const x = 왼 + 칸 * i + 8;
      const 이론 = 조작 ? 조작무게[i] / 합 : 1 / 6;
      return [
        s('rect', { x, y: y(p), width: 칸 - 16, height: y(0) - y(p), class: 'bar' }),
        // 이론값은 점선 + 가로 막대 모양으로 (색만으로 구분하지 않기)
        s('line', { x1: x - 4, x2: x + 칸 - 12, y1: y(이론), y2: y(이론), class: 'theory' }),
        s('text', { x: x + (칸 - 16) / 2, y: H - 22, class: 'tick', 'text-anchor': 'middle' }, `${i + 1}`),
        요.n ? s('text', { x: x + (칸 - 16) / 2, y: y(p) - 4, class: 'val', 'text-anchor': 'middle' }, `${Math.round(p * 100)}%`) : null,
      ];
    }),
    s('text', { x: W - 10, y: H - 4, class: 'tick', 'text-anchor': 'end' }, '- - - 이론상 비율'),
  );
}

function 누적그림(요, 기대) {
  const W = 420, H = 230, 왼 = 40, 아래 = 40, 위 = 12, 오 = 10;
  const 최대n = Math.max(10, 요.n);
  const lx = (n) => 왼 + (W - 왼 - 오) * (Math.log10(n) / Math.log10(최대n));
  const y = (v) => 위 + (H - 아래 - 위) * (1 - (v - 1) / 5);
  const 길 = 요.누적.map((p, i) => `${i ? 'L' : 'M'}${lx(p.n).toFixed(1)},${y(p.평균).toFixed(1)}`).join(' ');
  const 눈금 = [1, 10, 100, 1000, 10000, 100000].filter((n) => n <= 최대n);
  return s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'svg-chart', role: 'img', 'aria-label': '던진 횟수에 따른 누적 평균' },
    [1, 2, 3, 4, 5, 6].map((v) => [
      s('line', { x1: 왼, x2: W - 오, y1: y(v), y2: y(v), class: 'grid' }),
      s('text', { x: 왼 - 6, y: y(v) + 4, class: 'tick', 'text-anchor': 'end' }, String(v)),
    ]),
    눈금.map((n) => s('text', { x: lx(n), y: H - 22, class: 'tick', 'text-anchor': 'middle' }, n.toLocaleString('ko-KR'))),
    s('text', { x: (W + 왼) / 2, y: H - 4, class: 'tick', 'text-anchor': 'middle' }, '던진 횟수 (10배씩 늘어나는 눈금)'),
    s('line', { x1: 왼, x2: W - 오, y1: y(기대), y2: y(기대), class: 'theory' }),
    s('text', { x: W - 오, y: y(기대) - 6, class: 'val', 'text-anchor': 'end' }, `기댓값 ${반올림(기대, 3)}`),
    s('path', { d: 길, class: 'line' }),
  );
}

function 점줄그림(평균들) {
  const W = 640, H = 110, 왼 = 20, 오 = 20;
  const x = (v) => 왼 + (W - 왼 - 오) * ((v - 1) / 5);
  const 쌓임 = {};
  return s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'svg-chart', role: 'img', 'aria-label': '실험 평균들의 분포' },
    s('rect', { x: x(3.4), y: 6, width: x(3.6) - x(3.4), height: H - 36, class: 'band' }),
    s('text', { x: x(3.5), y: H - 4, class: 'val', 'text-anchor': 'middle' }, '3.4~3.6'),
    s('line', { x1: 왼, x2: W - 오, y1: H - 30, y2: H - 30, class: 'axis' }),
    [1, 2, 3, 4, 5, 6].map((v) => s('text', { x: x(v), y: H - 16, class: 'tick', 'text-anchor': 'middle' }, String(v))),
    평균들.map((m) => {
      const 칸 = Math.round(m * 20);
      쌓임[칸] = (쌓임[칸] || 0) + 1;
      const 안 = m >= 3.4 - 1e-9 && m <= 3.6 + 1e-9;
      return s('circle', { cx: x(m), cy: H - 30 - 7 - (쌓임[칸] - 1) * 12, r: 5.5, class: 안 ? 'dot in' : 'dot' });
    }),
  );
}

// ───────────────────────────── 📈 평균과 중앙값 ─────────────────────────────
function 회귀판(조작함) {
  let 점들 = 기본점들.map((p) => ({ ...p }));
  let 잔차보기 = true;
  let 끄는중 = -1;
  const W = 640, H = 400, 왼 = 56, 오 = 20, 위 = 16, 아래 = 46;
  const sx = (x) => 왼 + (W - 왼 - 오) * (x / 10);
  const sy = (y) => 위 + (H - 위 - 아래) * (1 - y / 100);

  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'svg-chart drag-area', role: 'img', 'aria-label': '공부 시간과 점수 산점도. 점을 끌어 옮길 수 있다.' });
  const 통계 = h('div', { class: 'stat-row' });
  const 목록 = h('div', { class: 'num-chips' });
  const 안내 = h('div', { class: 'sim-note' });

  const 좌표 = (e) => {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return {
      x: Math.max(0, Math.min(10, ((p.x - 왼) / (W - 왼 - 오)) * 10)),
      y: Math.max(0, Math.min(100, (1 - (p.y - 위) / (H - 위 - 아래)) * 100)),
    };
  };
  svg.addEventListener('pointerdown', (e) => {
    const i = Number(e.target?.dataset?.i);
    if (!Number.isInteger(i)) return;
    끄는중 = i;
    svg.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  svg.addEventListener('pointermove', (e) => {
    if (끄는중 < 0) return;
    const p = 좌표(e);
    점들[끄는중] = { x: Math.round(p.x * 10) / 10, y: Math.round(p.y) };
    조작함();
    새로();
  });
  const 놓기 = () => { 끄는중 = -1; };
  svg.addEventListener('pointerup', 놓기);
  svg.addEventListener('pointercancel', 놓기);

  function 새로() {
    const ys = 점들.map((p) => p.y);
    const 평 = 평균(ys);
    const 중 = 중앙값(ys);
    const 선 = 회귀선(점들);
    const 칠 = [];
    for (let v = 0; v <= 100; v += 20) {
      칠.push(s('line', { x1: 왼, x2: W - 오, y1: sy(v), y2: sy(v), class: 'grid' }));
      칠.push(s('text', { x: 왼 - 8, y: sy(v) + 5, class: 'tick', 'text-anchor': 'end' }, String(v)));
    }
    for (let v = 0; v <= 10; v += 2) 칠.push(s('text', { x: sx(v), y: H - 24, class: 'tick', 'text-anchor': 'middle' }, String(v)));
    칠.push(s('text', { x: (W + 왼) / 2, y: H - 4, class: 'tick', 'text-anchor': 'middle' }, '하루 공부 시간 (시간)'));
    칠.push(s('text', { x: 14, y: 위 + 4, class: 'tick' }, '점수'));
    if (선) {
      if (잔차보기) 점들.forEach((p) => 칠.push(s('line', { x1: sx(p.x), x2: sx(p.x), y1: sy(p.y), y2: sy(Math.max(0, Math.min(100, 선.기울기 * p.x + 선.절편))), class: 'resid' })));
      // 회귀선은 그림 안(점수 0~100)에서만 그린다
      const 끝점 = [0, 10].map((x) => ({ x, y: 선.기울기 * x + 선.절편 }));
      칠.push(s('line', { x1: sx(끝점[0].x), y1: sy(끝점[0].y), x2: sx(끝점[1].x), y2: sy(끝점[1].y), class: 'reg-line', 'clip-path': 'url(#reg-clip)' }));
    }
    칠.push(s('line', { x1: 왼, x2: W - 오, y1: sy(평), y2: sy(평), class: 'mean-line' }));
    칠.push(s('text', { x: W - 오 - 4, y: sy(평) - 6, class: 'val mean-t', 'text-anchor': 'end' }, `━ 평균 ${반올림(평, 1)}`));
    칠.push(s('line', { x1: 왼, x2: W - 오, y1: sy(중), y2: sy(중), class: 'median-line' }));
    칠.push(s('text', { x: 왼 + 6, y: sy(중) + (중 > 평 ? -6 : 16), class: 'val median-t' }, `┅ 중앙값 ${반올림(중, 1)}`));
    점들.forEach((p, i) => 칠.push(s('circle', { cx: sx(p.x), cy: sy(p.y), r: 12, class: 'pt' + (끄는중 === i ? ' on' : ''), 'data-i': i })));
    svg.replaceChildren(
      s('defs', {}, s('clipPath', { id: 'reg-clip' }, s('rect', { x: 왼, y: 위, width: W - 왼 - 오, height: H - 위 - 아래 }))),
      ...칠);

    통계.replaceChildren(
      h('div', { class: 'stat' }, h('span', {}, '━ 평균'), h('b', {}, 반올림(평, 1))),
      h('div', { class: 'stat' }, h('span', {}, '┅ 중앙값'), h('b', {}, 반올림(중, 1))),
      h('div', { class: 'stat' }, h('span', {}, '평균 − 중앙값'), h('b', {}, 반올림(평 - 중, 1))),
      h('div', { class: 'stat' }, h('span', {}, '회귀선 기울기'), h('b', {}, 선 ? 반올림(선.기울기, 2) : '—')),
      h('div', { class: 'stat' }, h('span', {}, '상관계수 r'), h('b', {}, 선 && 선.r != null ? 반올림(선.r, 2) : '—')),
    );
    안내.textContent = !선 ? '⚠ 점들이 한 세로줄에 모두 서 있으면 직선을 하나로 정할 수 없어요(기울기를 셀 수 없음).'
      : 선.r == null ? '⚠ 점수가 모두 같으면 상관계수를 셀 수 없어요.' : '';
    const 정렬 = [...ys].sort((a, b) => a - b);
    목록.replaceChildren(
      h('span', { class: 'muted' }, '작은 순서로: '),
      ...정렬.map((v, i) => h('span', { class: 'num-chip' + (i === 4 || i === 5 ? ' mid' : '') }, String(v))),
      h('span', { class: 'muted small' }, ' ← 가운데 두 값(굵은 테두리)의 평균이 중앙값'),
    );
  }

  새로();
  return h('div', { class: 'sim' },
    h('p', { class: 'muted' }, '👆 점을 끌어 옮겨 보세요. 하나를 아주 아래로 끌어내리면 무엇이 얼마나 움직일까요?'),
    h('div', { class: 'row wrap' },
      h('button', { class: 'btn', onClick: () => { 조작함(); 점들 = 기본점들.map((p) => ({ ...p })); 새로(); } }, '⏮ 처음으로'),
      h('label', { class: 'switch-label' }, h('input', { type: 'checkbox', checked: 잔차보기, onChange: (e) => { 잔차보기 = e.target.checked; 새로(); } }), ' 잔차(점과 회귀선 사이 거리) 보기')),
    svg, 안내, 통계,
    h('div', { class: 'card inner' }, h('h4', {}, '🧮 손으로 확인해 보기 (작은 예)'), 목록),
  );
}

// ───────────────────────────── 🔢 정렬 비교 ─────────────────────────────
function 정렬판(조작함) {
  const N = 20;
  let 방법 = 'bubble', 모양 = 'random', 시드 = 7, 속도 = 5;
  let 걸음 = [], 위치 = 0, 타이머 = null;

  const svg = s('svg', { viewBox: '0 0 640 260', class: 'svg-chart', role: 'img', 'aria-label': '정렬 막대' });
  const 셈 = h('div', { class: 'stat-row' });
  const 단추줄 = h('div', { class: 'row wrap' });
  const 방법줄 = h('div', { class: 'seg' });
  const 모양줄 = h('div', { class: 'seg' });
  const 견줌자리 = h('div', {});
  const 시드칸 = h('input', { type: 'number', class: 'seed-input', value: 시드, min: 1, 'aria-label': '시드 번호',
    onChange: (e) => { 시드 = Math.max(1, Math.floor(Number(e.target.value) || 1)); e.target.value = 시드; 조작함(); 준비(); } });

  const 멈추기 = () => { if (타이머 != null) { clearInterval(타이머); 타이머 = null; } };
  function 준비() {
    멈추기();
    걸음 = 정렬걸음(배열만들기(N, 모양, 시드), 방법);
    위치 = 0;
    견줌자리.replaceChildren();
    그림();
  }
  const 한걸음 = () => {
    if (위치 < 걸음.length - 1) 위치++;
    if (위치 >= 걸음.length - 1) 멈추기();
    그림();
  };
  const 재생 = () => {
    조작함();
    if (타이머 != null) { 멈추기(); 그림(); return; }
    if (위치 >= 걸음.length - 1) 위치 = 0;
    타이머 = 화면타이머(한걸음, Math.round(900 / 속도));
    그림();
  };

  function 그림() {
    const g = 걸음[위치];
    const 끝 = g.종류 === '끝';
    const 칸 = 600 / N;
    svg.replaceChildren(...g.배열.flatMap((v, i) => {
      const 비교중 = !끝 && g.종류 === '비교' && (i === g.i || i === g.j);
      const 교환중 = !끝 && g.종류 === '교환' && (i === g.i || i === g.j);
      const 높이 = (v / N) * 200;
      const x = 20 + i * 칸 + 2;
      return [
        s('rect', { x, y: 230 - 높이, width: 칸 - 4, height: 높이, class: 'sbar' + (끝 ? ' done' : 교환중 ? ' swap' : 비교중 ? ' cmp' : '') }),
        // 색만으로 구분하지 않도록 위에 기호를 함께 단다
        (비교중 || 교환중) ? s('text', { x: x + (칸 - 4) / 2, y: 222 - 높이, class: 'mark', 'text-anchor': 'middle' }, 교환중 ? '⇄' : '?') : null,
        s('text', { x: x + (칸 - 4) / 2, y: 250, class: 'tick', 'text-anchor': 'middle' }, String(v)),
      ];
    }).filter(Boolean));
    셈.replaceChildren(
      h('div', { class: 'stat' }, h('span', {}, '? 비교'), h('b', {}, `${g.비교}번`)),
      h('div', { class: 'stat' }, h('span', {}, '⇄ 교환'), h('b', {}, `${g.교환}번`)),
      h('div', { class: 'stat' }, h('span', {}, '걸음'), h('b', {}, `${위치} / ${걸음.length - 1}`)),
      h('div', { class: 'stat' }, h('span', {}, '상태'), h('b', {}, 끝 ? '✓ 정렬 끝' : 타이머 != null ? '▶ 재생 중' : '⏸ 멈춤')),
    );
    단추줄.replaceChildren(
      h('button', { class: 'btn primary', onClick: 재생 }, 타이머 != null ? '⏸ 멈춤' : '▶ 재생'),
      h('button', { class: 'btn', disabled: 타이머 != null || 끝, onClick: () => { 조작함(); 한걸음(); } }, '⏭ 한 단계씩'),
      h('button', { class: 'btn', onClick: () => { 조작함(); 멈추기(); 위치 = 걸음.length - 1; 그림(); } }, '⏩ 끝까지'),
      h('button', { class: 'btn', onClick: () => { 조작함(); 멈추기(); 위치 = 0; 그림(); } }, '⏮ 처음으로'),
    );
    방법줄.replaceChildren(...정렬방법들.map((m) => h('button', { class: 'seg-btn' + (m.id === 방법 ? ' on' : ''), onClick: () => { 방법 = m.id; 조작함(); 준비(); } }, m.이름)));
    모양줄.replaceChildren(...배열모양들.map((m) => h('button', { class: 'seg-btn' + (m.id === 모양 ? ' on' : ''), onClick: () => { 모양 = m.id; 조작함(); 준비(); } }, m.이름)));
    시드칸.disabled = 모양 !== 'random';
  }

  const 견주기 = () => {
    조작함();
    const 표 = h('table', { class: 'tbl compare-sort' },
      h('thead', {}, h('tr', {}, h('th', {}, '비교 / 교환'), ...배열모양들.map((m) => h('th', {}, m.이름 + (m.id === 'random' ? ` (시드 ${시드})` : ''))))),
      h('tbody', {}, 정렬방법들.map((m) => h('tr', {}, h('th', {}, m.이름),
        ...배열모양들.map((모) => {
          const 마지막 = 정렬걸음(배열만들기(N, 모.id, 시드), m.id).at(-1);
          return h('td', {}, `${마지막.비교}번 / ${마지막.교환}번`);
        })))));
    견줌자리.replaceChildren(h('p', { class: 'muted' }, `막대 ${N}개를 끝까지 정렬했을 때의 횟수예요.`), 표);
  };

  준비();
  return h('div', { class: 'sim' },
    h('div', { class: 'ctrl' }, h('span', { class: 'ctrl-label' }, '정렬 방법'), 방법줄),
    h('div', { class: 'ctrl' }, h('span', { class: 'ctrl-label' }, '처음 배열 모양'), 모양줄, h('label', { class: 'switch-label' }, '🌱 시드 ', 시드칸)),
    h('div', { class: 'ctrl' }, h('span', { class: 'ctrl-label' }, '재생 속도'),
      h('input', { type: 'range', class: 'slider', min: 1, max: 10, value: 속도, 'aria-label': '재생 속도',
        onChange: (e) => { 속도 = Number(e.target.value); if (타이머 != null) { 멈추기(); 타이머 = 화면타이머(한걸음, Math.round(900 / 속도)); } } })),
    단추줄, svg,
    h('p', { class: 'muted small' }, '? 노란 막대 = 비교하는 중 · ⇄ 빨간 막대 = 자리를 바꾸는 중 · 초록 = 정렬 끝'),
    셈,
    h('div', { class: 'card inner' },
      h('h4', {}, '📊 세 방법 × 세 모양 한꺼번에 견주기'),
      h('p', { class: 'muted' }, '먼저 위에서 몇 가지를 직접 돌려 본 뒤에 눌러 보세요.'),
      h('button', { class: 'btn', onClick: 견주기 }, '표로 견주기'),
      견줌자리),
  );
}
