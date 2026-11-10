/*! 만지는 설명 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  ⑤ 짝 시험 — 짝이 내 앱을 먼저 예측하고 써 본 뒤, 일부러 부숴 본다.
 *  짝이 내 컴퓨터에서 직접 적는다(짝의 이름은 받지 않는다).
 */
import { h, md, 상자, 토스트 } from '../lib/ui.js';
import { 자료, 자료적기 } from '../lib/store.js';
import { 복사 } from '../lib/copy.js';
import { 부숴보기들, 최소부숴보기, 최소글자, 글자수 } from '../data/activities.js';
import { 링크검사 } from '../engine/design.js';

export const 하위들 = [{ id: 'main', label: '짝 시험' }];

const 아하보기 = ['🤩 왔다! 예측과 달라서 놀랐다', '🙂 조금 — 알 듯 말 듯', '😐 아니 — 무엇을 알려 주는지 모르겠다'];

export function 그리기(자리, 하위, 이동) {
  const 설계 = 자료('design') || {};
  const 낸것 = 자료('build') || {};
  const 링크 = 낸것.방식 === 'file' ? '' : (낸것.링크 || '');
  const p = { 짝예측: '', 실제: '', 아하: '', 부숴: {}, 깨진것: '', 좋은점: '', 고칠점: '', 내고칠: '', ...(자료('pair') || {}) };
  p.부숴 = { ...(p.부숴 || {}) };
  const 저장 = () => { 자료적기('pair', JSON.parse(JSON.stringify(p))); 셈그리기(); };

  const 셈 = {};
  const 셈그리기 = () => {
    for (const [k, el] of Object.entries(셈)) {
      const n = 글자수(p[k]);
      el.textContent = `${n}자 / ${최소글자[k]}자 이상`;
      el.className = 'count' + (n >= 최소글자[k] ? ' ok' : '');
    }
    체크셈.textContent = `${부숴보기들.filter((x) => p.부숴[x.id]).length}가지 / ${최소부숴보기}가지 이상`;
    체크셈.className = 'count' + (부숴보기들.filter((x) => p.부숴[x.id]).length >= 최소부숴보기 ? ' ok' : '');
  };
  const 체크셈 = h('span', { class: 'count' });

  const 칸 = (열쇠, 이름, 예, 줄 = 2) => {
    if (최소글자[열쇠]) 셈[열쇠] = h('span', { class: 'count' });
    return h('div', { class: 'field' },
      h('div', { class: 'field-head' }, h('label', { class: 'field-label' }, 이름), 셈[열쇠]),
      h('textarea', { rows: 줄, value: p[열쇠], placeholder: 예, 'aria-label': 이름, onInput: (e) => { p[열쇠] = e.target.value; 저장(); } }));
  };

  const 아하줄 = h('div', { class: 'choices tight' });
  const 아하그리기 = () => 아하줄.replaceChildren(...아하보기.map((x) => h('button', {
    class: 'choice' + (p.아하 === x ? ' chosen' : ''), 'aria-pressed': p.아하 === x ? 'true' : 'false',
    onClick: () => { p.아하 = x; 저장(); 아하그리기(); },
  }, x)));
  아하그리기();

  const 요청문장 = () => `짝 시험에서 이런 의견이 나왔어: "${String(p.고칠점).trim()}"\n이 부분만 고쳐줘. 다른 부분은 그대로 두고, 무엇을 고쳤는지 한 줄로 알려줘.`;
  const 링크상태 = 링크검사(링크);

  자리.append(
    h('h2', {}, '🧪 짝 시험과 부숴 보기'),
    h('p', { class: 'lead', html: md('만든 사람은 자기 앱의 약점을 보지 못합니다. **짝이 내 자리에 앉아** 아래를 순서대로 직접 적어 주세요. (짝의 이름은 적지 않아요)') }),
    h('div', { class: 'card pair-top' },
      h('h3', {}, '1. 앱을 열기 전에 — 이 물음에 먼저 예측해 주세요'),
      h('p', { class: 'big-q' }, 설계.예측 ? `「${설계.예측}」` : '(③ 설계하기에서 예측 질문을 먼저 적어요)'),
      링크상태.ok
        ? h('a', { class: 'btn', href: 링크, target: '_blank', rel: 'noopener' }, '🔗 예측을 적은 뒤에 앱 열기 ↗')
        : h('p', { class: 'muted' }, 낸것.방식 === 'file'
          ? `저장한 HTML 파일(${낸것.파일 || '파일 이름 미입력'})을 더블클릭해 짝에게 열어 주세요.`
          : '공유 링크가 아직 없어요. 캔버스 화면을 그대로 짝에게 보여 주어도 됩니다.'),
      칸('짝예측', '짝의 예측', '예) 30명쯤은 모여야 50%가 넘을 것 같다')),
    h('div', { class: 'card' },
      h('h3', {}, '2. 앱을 써 본 뒤'),
      칸('실제', '실제로 해 보니 어땠나요?', '예) 23명에서 벌써 50%가 넘어서 놀랐다'),
      h('div', { class: 'field' }, h('label', { class: 'field-label' }, '「아하!」가 왔나요?'), 아하줄)),
    h('div', { class: 'card' },
      h('div', { class: 'field-head' }, h('h3', {}, '3. 🔨 부숴 보기 — 일부러 괴롭혀 보세요'), 체크셈),
      h('p', { class: 'muted' }, '프로그래머는 「잘 되는지」보다 「어디서 깨지는지」를 먼저 찾아봅니다. 해 본 것에 표시하세요.'),
      h('div', { class: 'break-list' }, 부숴보기들.map((x) => h('label', { class: 'eye-switch' },
        h('input', { type: 'checkbox', checked: !!p.부숴[x.id], onChange: (e) => { p.부숴[x.id] = e.target.checked; 저장(); } }),
        h('span', {}, x.글)))),
      칸('깨진것', '깨지거나 이상했던 것 (없으면 「없음」)', '예) 사람 수를 0으로 두니 그래프가 사라졌다')),
    h('div', { class: 'card' },
      h('h3', {}, '4. 짝의 의견'),
      칸('좋은점', '좋았던 점', '예) 점이 선으로 이어지는 것이 한눈에 보였다'),
      칸('고칠점', '고치면 좋을 점 하나', '예) 처음에 무엇을 해야 할지 안내가 없었다')),
    h('div', { class: 'card download' },
      h('h3', {}, '5. 만든 사람이 — 무엇을 고칠까?'),
      칸('내고칠', '짝의 의견을 듣고 고칠 것 한 가지', '예) 맨 위에 「사람 수를 움직여 보세요」 안내를 넣겠다'),
      h('button', { class: 'btn', onClick: async () => {
        const ok = await 복사(요청문장());
        토스트(ok ? '📋 고쳐 달라는 문장을 복사했어요. 캔버스에 붙여 넣으세요.' : '복사가 막혔어요.');
      } }, '📋 짝 의견을 캔버스 요청 문장으로 복사'),
      h('p', { class: 'muted small' }, '고친 뒤에는 ④ 캔버스로 만들기의 「고친 기록」에도 한 줄 더하세요.')),
    상자('info', '💬 짝 시험 예절', h('p', {}, '고칠 점은 「사람」이 아니라 「앱」에 대해 말해요. 「이건 별로야」 대신 「여기서 무엇을 해야 할지 몰랐어」처럼 겪은 일을 말하면 고치기 쉬워요.')),
  );
  셈그리기();
}
