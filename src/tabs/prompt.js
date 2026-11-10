/*! 만지는 설명 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  ④ 프롬프트·제작 — 프로그래머의 눈 · 프롬프트 조립기 · 캔버스로 만들고 고친 기록.
 *
 *  「보통 프롬프트」와 「프로그래머의 눈을 켠 프롬프트」를 나란히 보여 주어,
 *  프로그래밍을 배운 사람이 무엇을 더 챙기는지 눈으로 보게 한다.
 */
import { h, md, 상자, 토스트, 알림 } from '../lib/ui.js';
import { 자료, 자료적기 } from '../lib/store.js';
import { 문항목록 } from '../lib/quiz.js';
import { 복사 } from '../lib/copy.js';
import {
  빈설계, 설계완료, 프롬프트만들기, 프롬프트요소, 눈목록, 고치기문장, 링크검사, 파일이름검사, 다시시작프롬프트,
} from '../engine/design.js';
import * as 둘러보기 from './tour.js';
import { 최소글자 } from '../data/activities.js';

export const 하위들 = [
  { id: 'eye', label: '🧑‍💻 프로그래머의 눈' },
  { id: 'make', label: '🪄 프롬프트 조립기' },
  { id: 'tour', label: '🧭 캔버스 둘러보기' },
  { id: 'canvas', label: '🛠️ 캔버스로 만들기' },
];

const 제미나이주소 = 'https://gemini.google.com/app';

export function 그리기(자리, 하위, 이동) {
  if (하위 === 'make') 조립기(자리, 이동);
  else if (하위 === 'tour') 둘러보기.그리기(자리);
  else if (하위 === 'canvas') 캔버스(자리);
  else 눈(자리);
}

// ───────────────────────────── 프로그래머의 눈 ─────────────────────────────
function 눈(자리) {
  자리.append(
    h('h2', {}, '🧑‍💻 프로그래머의 눈 — 한 끗 차이'),
    h('p', { class: 'lead', html: md('AI에게 똑같이 「만들어 줘」라고 해도, 프로그래밍을 배운 사람은 **무엇이 깨질지 미리 떠올리고 그것까지 요구합니다.** 처음 만드는 사람은 생각하기 어려운 여덟 가지입니다.') }),
    h('div', { class: 'eye-grid' }, 눈목록.map((e) => h('div', { class: 'card eye-card' },
      h('h4', {}, e.이름),
      h('p', {}, e.왜),
      h('div', { class: 'eye-line' }, h('span', { class: 'muted small' }, '프롬프트에 붙는 한 줄'), h('div', {}, `「${e.줄}」`))))),
    상자('now', '🔧 고칠 때도 다릅니다',
      h('ul', {},
        h('li', { html: md('**한 번에 하나씩** 고쳐 달라고 한다 — 여러 개를 한꺼번에 요청하면 무엇 때문에 깨졌는지 모른다.') }),
        h('li', { html: md('**잘 되던 판을 기억한다** — 고친 뒤 더 나빠지면 앞의 판으로 되돌린다.') }),
        h('li', { html: md('**AI가 보여 준 숫자를 믿지 않고 검산한다** — 작은 예로 손 계산과 맞춰 본다.') }))),
    h('h3', { class: 'sec' }, '확인 문제 — 무엇을 미리 챙겼어야 했을까?'),
    문항목록('eye-quiz'),
  );
}

// ───────────────────────────── 프롬프트 조립기 ─────────────────────────────
function 조립기(자리, 이동) {
  const d = { ...빈설계(), ...(자료('design') || {}) };
  d.눈 = { ...(d.눈 || {}) };
  const 저장 = () => 자료적기('design', JSON.parse(JSON.stringify(d)));

  const 요소자리 = h('div', { class: 'badge-row' });
  const 보통자리 = h('pre', { class: 'prompt-box plain' });
  const 내자리 = h('pre', { class: 'prompt-box' });
  const 셈자리 = h('p', { class: 'muted small' });

  const 새로 = () => {
    요소자리.replaceChildren(...프롬프트요소(d).map((x) => h('span', { class: 'badge' + (x.ok ? ' ok' : '') }, (x.ok ? '✅ ' : '⬜ ') + x.이름)));
    const 보통 = 프롬프트만들기(d, { 눈켜기: false });
    const 내 = 프롬프트만들기(d);
    보통자리.textContent = 보통;
    // 프로그래머의 눈으로 더해진 줄은 표시해 둔다
    const 보통줄 = new Set(보통.split('\n'));
    // 더해진 줄은 덩어리(block)로 칠하므로 줄바꿈 글자를 따로 붙이지 않는다(붙이면 빈 줄이 두 번 생긴다).
    내자리.replaceChildren(...내.split('\n').map((줄) => {
      const 더함 = !보통줄.has(줄);
      return h('span', { class: 더함 ? 'added' : '' }, 더함 ? 줄 : 줄 + '\n');
    }));
    const 켠 = 눈목록.filter((e) => d.눈[e.id]).length;
    셈자리.textContent = `보통 프롬프트 ${보통.length}자 → 내 프롬프트 ${내.length}자 (프로그래머의 눈 ${켠}가지를 켬)`;
  };

  const 눈스위치 = h('div', { class: 'eye-switches' }, 눈목록.map((e) => h('label', { class: 'eye-switch' },
    h('input', { type: 'checkbox', checked: !!d.눈[e.id], onChange: (ev) => { d.눈[e.id] = ev.target.checked; 저장(); 새로(); } }),
    h('span', {}, h('b', {}, e.이름), h('small', { class: 'muted' }, e.왜)))));

  const 복사하기 = async () => {
    const 글 = 프롬프트만들기(d);
    const ok = await 복사(글);
    자료적기('prompt', { 복사: true, 글, 때: new Date().toISOString() });
    if (ok) 토스트('📋 복사했어요! 제미나이 캔버스 입력창에 붙여 넣으세요 (Ctrl+V).');
    else {
      await 알림('자동 복사가 막혔어요', h('div', {}, h('p', {}, '아래 글을 모두 골라(Ctrl+A) 복사(Ctrl+C)하세요.'), h('textarea', { rows: 10, value: 글, readonly: true })));
    }
  };

  새로();
  // ⚠ append 는 false 를 「false」 글자로 넣는다 — 조건부 자리는 filter(Boolean) 로 걸러 낸다.
  자리.append(...[
    h('h2', {}, '🪄 프롬프트 조립기'),
    !설계완료(d) && 상자('warn', '⚠ 설계가 아직 덜 됐어요',
      h('p', {}, '빈칸은 「(… 적어요)」로 들어갑니다. 설계를 먼저 마치면 프롬프트가 완성돼요.'),
      h('button', { class: 'btn', onClick: () => 이동('design') }, '③ 설계하기로 가기')),
    h('div', { class: 'card' }, h('h3', {}, '좋은 프롬프트의 6요소'), 요소자리,
      h('p', { class: 'muted small' }, '기술과 형식 · 화면 구성 · 조작 요소 · 피드백 · 학습 목표 · 대상 — 학습 목표와 대상은 꼭 넣으세요. 안내 문구와 기본값이 그에 맞게 바뀝니다.')),
    h('div', { class: 'card' },
      h('h3', {}, '🧑‍💻 프로그래머의 눈 켜기'),
      h('p', { class: 'muted' }, '켤수록 꼼꼼한 앱이 나오지만, 프롬프트가 길어집니다. 내 앱에 꼭 필요한 것을 골라 보세요.'),
      h('label', { class: 'eye-switch strong' },
        h('input', { type: 'checkbox', checked: d.예측먼저 !== false, onChange: (ev) => { d.예측먼저 = ev.target.checked; 저장(); 새로(); } }),
        h('span', {}, h('b', {}, '예측 먼저 묻기 (권장)'), h('small', { class: 'muted' }, '조작하기 전에 예측 질문을 보여 주고 고르게 한다 — 예측 → 조작 → 설명'))),
      눈스위치),
    h('div', { class: 'two prompt-compare' },
      h('div', {}, h('h4', {}, '보통 프롬프트'), 보통자리),
      h('div', {}, h('h4', {}, '내 프롬프트 ', h('span', { class: 'added-tag' }, '＋ 프로그래머의 눈')), 내자리)),
    셈자리,
    h('div', { class: 'row wrap' },
      h('button', { class: 'btn primary big', onClick: 복사하기 }, '📋 내 프롬프트 복사하기'),
      h('a', { class: 'btn big', href: 제미나이주소, target: '_blank', rel: 'noopener' }, '✨ 제미나이 열기 ↗')),
    상자('tip', '다음 할 일', h('p', {}, '복사했으면 [🧭 캔버스 둘러보기] 로 캔버스 화면을 익힌 뒤, [🛠️ 캔버스로 만들기] 에서 순서대로 따라 하세요.')),
  ].filter(Boolean));
}

// ───────────────────────────── 캔버스로 만들기 ─────────────────────────────
function 캔버스(자리) {
  const b = { 링크: '', 기록: [], 방식: 'link', 파일: '', ...(자료('build') || {}) };
  const 저장 = () => 자료적기('build', JSON.parse(JSON.stringify(b)));

  const 링크알림 = h('div', { class: 'fb' });
  const 링크새로 = () => {
    const r = 링크검사(b.링크);
    링크알림.className = 'fb ' + (r.ok && !r.경고 ? 'good' : r.ok ? 'hint' : 'bad');
    링크알림.textContent = r.글;
  };
  const 파일알림 = h('div', { class: 'fb' });
  const 파일새로 = () => {
    const r = 파일이름검사(b.파일);
    파일알림.className = 'fb ' + (r.ok ? 'good' : 'bad');
    파일알림.textContent = r.글;
  };

  // 꼬였을 때 새 채팅에 줄 정리 프롬프트 — 고친 기록이 바뀔 때마다 다시 만든다
  const 정리자리 = h('pre', { class: 'prompt-box plain' });
  const 정리새로 = () => { 정리자리.textContent = 다시시작프롬프트(자료('design') || 빈설계(), b.기록); };

  const 기록자리 = h('div', { class: 'log-rows' });
  const 결과들 = ['✅ 잘 고쳐짐', '⚠ 조금 나아짐', '❌ 다른 곳이 망가짐 → 앞 판으로 되돌림'];
  const 기록그리기 = () => {
    기록자리.replaceChildren(...[
      ...b.기록.map((r, i) => h('div', { class: 'log-row' },
        h('span', { class: 'log-no' }, `${i + 1}번째 요청`),
        h('input', { type: 'text', value: r.요청, placeholder: '무엇을 고쳐 달라고 했나요? (하나만)', 'aria-label': `${i + 1}번째 요청`,
          onInput: (e) => { r.요청 = e.target.value; 저장(); 정리새로(); } }),
        h('select', { class: 'select', 'aria-label': `${i + 1}번째 결과`, onChange: (e) => { r.결과 = e.target.value; 저장(); 정리새로(); } },
          h('option', { value: '' }, '결과는?'),
          ...결과들.map((x) => h('option', { value: x, selected: r.결과 === x ? true : null }, x))),
        h('button', { class: 'btn small ghost', 'aria-label': `${i + 1}번째 요청 지우기`, onClick: () => { b.기록.splice(i, 1); 저장(); 기록그리기(); 정리새로(); } }, '✕'))),
      b.기록.length < 8 && h('button', { class: 'btn small', onClick: () => { b.기록.push({ 요청: '', 결과: '' }); 저장(); 기록그리기(); } }, '＋ 고친 요청 더하기'),
    ].filter(Boolean));
  };
  if (!b.기록.length) b.기록.push({ 요청: '', 결과: '' });
  기록그리기();
  링크새로();
  파일새로();
  정리새로();

  // ── 내는 방법: 공유 링크 / HTML 파일 (학교 계정이 공유를 막으면 파일로) ──
  const 링크칸 = h('div', {},
    h('p', { html: md('캔버스 위쪽 **공유 단추(🔗)** 로 만든 링크를 붙여 넣어요.') }),
    h('input', { type: 'text', value: b.링크, placeholder: 'https://gemini.google.com/share/…', 'aria-label': '공유 링크',
      onInput: (e) => { b.링크 = e.target.value; 저장(); 링크새로(); } }),
    링크알림);
  const 파일칸 = h('div', {},
    h('ol', { class: 'steps-list' },
      h('li', { html: md('캔버스 위쪽 **다운로드 ▾ → 콘텐츠 복사** 를 누릅니다.') }),
      h('li', { html: md('**메모장**을 열고 붙여 넣습니다(Ctrl+V).') }),
      h('li', { html: md('**파일 → 다른 이름으로 저장** · 파일 형식은 **모든 파일** · 이름은 학번_앱이름.html') }),
      h('li', { html: md('저장한 파일을 **더블클릭해 열리는지** 확인하고, 선생님이 말한 곳에 냅니다.') })),
    h('input', { type: 'text', value: b.파일, placeholder: '예) 30512_진자실험실.html', 'aria-label': '저장한 파일 이름',
      onInput: (e) => { b.파일 = e.target.value; 저장(); 파일새로(); } }),
    파일알림,
    h('p', { class: 'muted small' }, '이 파일은 내 컴퓨터에서 열리는 사본이에요. 링크와 달리 고쳐도 저절로 바뀌지 않으니, 다 고친 뒤에 저장해요.'));
  const 방식줄 = h('div', { class: 'seg' });
  const 방식그리기 = () => {
    방식줄.replaceChildren(...[['link', '🔗 공유 링크로'], ['file', '📄 HTML 파일로']].map(([id, 글]) => h('button', {
      class: 'seg-btn' + (b.방식 === id ? ' on' : ''), 'aria-pressed': b.방식 === id ? 'true' : 'false',
      onClick: () => { b.방식 = id; 저장(); 방식그리기(); },
    }, 글)));
    링크칸.hidden = b.방식 === 'file';
    파일칸.hidden = b.방식 !== 'file';
  };
  방식그리기();

  자리.append(
    h('h2', {}, '🛠️ 제미나이 캔버스로 만들기'),
    h('div', { class: 'flow4' },
      h('div', {}, h('b', {}, '① 설계'), h('span', {}, '무엇이 필요한지 적어 두기')),
      h('div', {}, h('b', {}, '② 요청'), h('span', {}, '프롬프트를 붙여 넣어 보내기')),
      h('div', {}, h('b', {}, '③ 확인하고 고치기'), h('span', {}, '만져 보고 한 번에 하나씩')),
      h('div', {}, h('b', {}, '④ 공유'), h('span', {}, '링크나 파일로 내기'))),
    h('ol', { class: 'steps-list' },
      h('li', { html: md('**gemini.google.com** 에 들어가 **학교 계정**으로 로그인합니다.') }),
      h('li', { html: md('입력창 왼쪽 **＋ → 도구 더보기 → Canvas** 를 켭니다. (길을 모르면 [🧭 캔버스 둘러보기])') }),
      h('li', { html: md('[🪄 프롬프트 조립기] 에서 복사한 프롬프트를 붙여 넣고 보냅니다.') }),
      h('li', { html: md('오른쪽 미리보기에서 **직접 만져 봅니다.** 내 예측 질문의 답을 이 앱으로 찾을 수 있나요?') }),
      h('li', { html: md('고칠 점이 보이면 **한 번에 하나씩** 요청하고, 아래 「고친 기록」에 적습니다. 망가지면 **↶** 로 앞 판으로.') }),
      h('li', { html: md('다 되면 **공유 🔗** 로 링크를 만들어 아래에 붙입니다. 공유가 막히면 HTML 파일로 내요.') })),
    h('p', { class: 'muted small' }, '※ 제미나이 화면의 단추 이름과 자리는 바뀔 수 있어요. 안 보이면 선생님께 물어보세요.'),
    h('div', { class: 'card' },
      h('h3', {}, '🧰 고쳐 달라는 문장 모음'),
      h('p', { class: 'muted' }, '「다시 만들어 줘」 대신 증상을 콕 집어 말하면 잘 고쳐져요. 눌러서 복사한 뒤 ( ) 부분을 내 앱에 맞게 바꾸세요.'),
      h('div', { class: 'fix-grid' }, 고치기문장.map((x) => h('button', {
        class: 'fix-card',
        onClick: async () => { const ok = await 복사(x.문장); 토스트(ok ? '📋 복사했어요. 캔버스 입력창에 붙여 넣으세요.' : '복사가 막혔어요. 글을 직접 골라 복사하세요.'); },
      }, h('b', {}, `😵 ${x.증상}`), h('span', {}, x.문장))))),
    h('div', { class: 'card' },
      h('h3', {}, '📒 고친 기록'),
      h('p', { class: 'muted', html: md(`요청 하나에 한 줄씩. 적어도 한 번은 고쳐 보세요(${최소글자.고친요청}자 이상). **망가지면 앞 판으로 되돌리는 것도 실력**이에요.`) }),
      기록자리),
    h('details', { class: 'more' },
      h('summary', {}, '🔄 고칠수록 꼬일 때 — 새 채팅용 정리 프롬프트'),
      h('div', { class: 'more-body' },
        h('p', { html: md('대화가 길어지면 AI도 앞뒤를 헷갈립니다. **새 채팅을 열고(캔버스도 다시 켜고)** 아래 글을 한 번에 보내면, 처음 프롬프트에 **잘 고쳐진 요청(✅·⚠)** 을 더해 처음부터 다시 만들어요. ❌ 로 되돌린 요청은 빠집니다.') }),
        정리자리,
        h('button', { class: 'btn', onClick: async () => {
          const ok = await 복사(정리자리.textContent);
          토스트(ok ? '📋 정리 프롬프트를 복사했어요. 새 채팅에 붙여 넣으세요.' : '복사가 막혔어요. 글을 직접 골라 복사하세요.');
        } }, '📋 정리 프롬프트 복사'))),
    h('div', { class: 'card' },
      h('h3', {}, '📮 내 앱 내기'),
      방식줄, 링크칸, 파일칸,
      h('p', { class: 'muted small' }, '낸 링크·파일 이름은 다음 탭의 짝 시험과 내 활동지에 쓰여요.')),
  );
}

