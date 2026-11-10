/*! 만지는 설명 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  「내 활동지」 HTML 파일 만들기.
 *
 *  학생의 기록을 받아 HTML 글 한 덩어리를 돌려준다. 내려받으면 더블클릭으로 열리고 인쇄·PDF 저장이 된다.
 *  ⚠ 학생이 적은 글은 모두 이스케이프한다(이름 칸에 <script> 를 넣어도 글자로만 찍힌다).
 *  ⚠ DOM 을 쓰지 않는다(node 에서 시험한다). 바깥 자원도 부르지 않는다.
 */
import { 활동들, 활동점수, 전체점수, 진행률, 완료인가, 정답글, 답글, 부숴보기들 } from '../data/activities.js';
import { 예시들 } from '../data/explores.js';
import { 프롬프트만들기, 기술들, 쓴변수, 링크검사, 눈목록 } from '../engine/design.js';

export function 이스케이프(글) {
  return String(글 ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
const 평문 = (글) => 이스케이프(String(글 ?? '').replace(/\*\*/g, ''));
const 서술 = (글) => (String(글 ?? '').trim() ? 이스케이프(글).replace(/\n/g, '<br>') : '<span class="empty">(쓰지 않음)</span>');

export function 파일이름(학번, 이름) {
  const 조각 = [학번, 이름].map((x) => String(x ?? '').trim().replace(/[\\/:*?"<>|\s]+/g, '')).filter(Boolean);
  return `만지는설명_활동지${조각.length ? '_' + 조각.join('_') : ''}.html`;
}

function 결과칸(r) {
  if (!r) return '<td class="res none">— 아직 안 풂</td>';
  if (r.ok) return `<td class="res ok">✅ 맞음${r.n > 1 ? ` (${r.n}번째 시도)` : ''}</td>`;
  if (r.shown) return '<td class="res shown">📖 정답을 보고 넘어감</td>';
  return `<td class="res wrong">❌ 다시 풀어야 함 (${r.n}번 시도)</td>`;
}

function 퀴즈표(기록, 활동) {
  const 답들 = 기록.acts[활동.key] || {};
  const 점 = 활동점수(기록, 활동);
  const 줄들 = 활동.문항.map((문항, i) => {
    const r = 답들[문항.id];
    const 내답 = 평문(답글(문항, r)) || '<span class="empty">-</span>';
    const 정답 = r?.shown ? `<br><small>정답: ${평문(정답글(문항))}</small>` : '';
    return `<tr><td class="no">${i + 1}</td><td>${평문(문항.q)}</td><td>${내답}${정답}</td>${결과칸(r)}</tr>`;
  }).join('');
  return `<h3>${이스케이프(활동.제목)} <span class="score">${점.맞음} / ${점.전체}</span></h3>
<table class="q"><thead><tr><th>번호</th><th>문항</th><th>내 답</th><th>결과</th></tr></thead><tbody>${줄들}</tbody></table>`;
}

function 맛보기칸(기록, 활동) {
  const 예 = 예시들[활동.예시];
  const e = 기록.data['ex-' + 활동.예시] || {};
  const 예측 = e.예측 != null ? 이스케이프(예.보기[e.예측]) : '<span class="empty">(고르지 않음)</span>';
  const 같음 = e.예측 != null ? (e.예측 === 예.실제 ? ' <span class="ok">— 예측이 맞음</span>' : ' <span class="shown">— 예측과 달랐음</span>') : '';
  return `<h3>${이스케이프(예.제목)}</h3>
<table class="spec"><tbody>
<tr><th>예측 질문</th><td>${평문(예.예측)}</td></tr>
<tr><th>내 예측</th><td>${예측}${같음}</td></tr>
<tr><th>직접 조작</th><td>${e.조작 ? '✅ 해 봄' : '<span class="empty">아직</span>'}</td></tr>
<tr><th>내 설명</th><td>${서술(e.설명)}</td></tr>
</tbody></table>`;
}

function 설계칸(기록) {
  const d = 기록.data.design;
  if (!d) return '<h3>나의 만지는 설명 설계</h3><p class="empty">(아직 설계하지 않음)</p>';
  const 변수 = 쓴변수(d);
  const 기술 = 기술들.find((t) => t.id === d.기술)?.이름 || '';
  const 변수표 = 변수.length
    ? 변수.map((v) => `${이스케이프(v.이름)} (${이스케이프(v.최소)} ~ ${이스케이프(v.최대)}${이스케이프(v.단위)}, 처음 ${이스케이프(v.기본)}${이스케이프(v.단위)})`).join('<br>')
    : '<span class="empty">(없음)</span>';
  return `<h3>나의 만지는 설명 설계</h3>
<table class="spec"><tbody>
<tr><th>과목·단원</th><td>${서술(d.과목)}</td></tr>
<tr><th>주제</th><td>${서술(d.주제)}</td></tr>
<tr><th>대상</th><td>${서술(d.대상)}</td></tr>
<tr><th>「아하!」 한 문장</th><td>${서술(d.아하)}</td></tr>
<tr><th>예측 질문</th><td>${서술(d.예측)}</td></tr>
<tr><th>바꿀 변수</th><td>${변수표}</td></tr>
<tr><th>화면</th><td>${서술(d.화면)}</td></tr>
<tr><th>바뀌는 결과</th><td>${서술(d.결과)}</td></tr>
<tr><th>만드는 도구</th><td>${이스케이프(기술)}</td></tr>
</tbody></table>`;
}

function 제작칸(기록) {
  const d = 기록.data.design;
  const p = 기록.data.prompt;
  const b = 기록.data.build || {};
  const 눈 = d ? 눈목록.filter((e) => d.눈?.[e.id]).map((e) => e.이름) : [];
  const 글 = p?.글 || (d ? 프롬프트만들기(d) : '');
  const 링크 = 링크검사(b.링크);
  const 링크칸 = b.방식 === 'file'
    ? `📄 HTML 파일로 냄 — ${b.파일 ? 이스케이프(b.파일) : '<span class="empty">(파일 이름 미입력)</span>'}`
    : b.링크 && 링크.ok ? `<a href="${이스케이프(b.링크)}">${이스케이프(b.링크)}</a>` : '<span class="empty">(붙이지 않음)</span>';
  const 고친 = (b.기록 || []).filter((r) => String(r.요청 || '').trim());
  const 고친표 = 고친.length
    ? `<table class="q"><thead><tr><th>번호</th><th>고쳐 달라고 한 것</th><th>결과</th></tr></thead><tbody>${고친.map((r, i) => `<tr><td class="no">${i + 1}</td><td>${이스케이프(r.요청)}</td><td>${이스케이프(r.결과 || '-')}</td></tr>`).join('')}</tbody></table>`
    : '<p class="empty">(고친 기록 없음)</p>';
  return `<h3>프롬프트와 제작</h3>
<p><b>켠 「프로그래머의 눈」</b>: ${눈.length ? 이스케이프(눈.join(' · ')) : '<span class="empty">(켜지 않음)</span>'}</p>
<p><b>캔버스에 넣은 프롬프트</b>${p?.복사 ? '' : ' <span class="shown">(아직 복사하지 않음)</span>'}</p>
<pre>${이스케이프(글) || '<span class="empty">(없음)</span>'}</pre>
<p><b>내 앱 낸 곳</b>: ${링크칸}</p>
<h4>고친 기록</h4>${고친표}`;
}

function 짝칸(기록) {
  const p = 기록.data.pair || {};
  const 체크 = 부숴보기들.map((x) => `<li>${p.부숴?.[x.id] ? '☑' : '☐'} ${이스케이프(x.글)}</li>`).join('');
  return `<h3>짝 시험과 부숴 보기</h3>
<table class="spec"><tbody>
<tr><th>짝의 예측</th><td>${서술(p.짝예측)}</td></tr>
<tr><th>써 본 결과</th><td>${서술(p.실제)}</td></tr>
<tr><th>「아하!」가 왔나</th><td>${서술(p.아하)}</td></tr>
<tr><th>부숴 보기</th><td><ul class="plain">${체크}</ul></td></tr>
<tr><th>깨진 것</th><td>${서술(p.깨진것)}</td></tr>
<tr><th>좋았던 점</th><td>${서술(p.좋은점)}</td></tr>
<tr><th>고칠 점</th><td>${서술(p.고칠점)}</td></tr>
<tr><th>내가 고칠 것</th><td>${서술(p.내고칠)}</td></tr>
</tbody></table>`;
}

function 정리칸(기록) {
  const r = 기록.data.reflect || {};
  return `<h3>오늘의 배움 정리</h3>
<p><b>새로 알게 된 것</b><br>${서술(r.배운점)}</p>
<p><b>더 궁금한 것</b><br>${서술(r.궁금)}</p>`;
}

export function 활동지HTML(기록, { 학번 = '', 이름 = '', 날짜 = new Date() } = {}) {
  const 점 = 전체점수(기록);
  const 진 = 진행률(기록);
  const 날 = `${날짜.getFullYear()}년 ${날짜.getMonth() + 1}월 ${날짜.getDate()}일 ${String(날짜.getHours()).padStart(2, '0')}:${String(날짜.getMinutes()).padStart(2, '0')}`;
  const 목차 = 활동들.map((a) => `<li>${완료인가(기록, a) ? '✅' : '⬜'} ${이스케이프(a.제목)}</li>`).join('');
  const 본문 = 활동들.map((a) => {
    switch (a.종류) {
      case 'quiz': return 퀴즈표(기록, a);
      case 'explore': return 맛보기칸(기록, a);
      case 'design': return 설계칸(기록);
      case 'prompt': return 제작칸(기록);
      case 'pair': return 짝칸(기록);
      case 'reflect': return 정리칸(기록);
      default: return '';   // build 는 제작칸에 함께 담는다
    }
  }).join('\n');

  return `<!doctype html>
<!-- 만지는 설명 실험실 — 활동지 · © 2026 티쳐무 · 모든 권리 보유 -->
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${이스케이프(파일이름(학번, 이름).replace(/\.html$/, ''))}</title>
<style>
:root{--ink:#1b2431;--ink2:#5a6779;--line:#d6dee8;--brand:#3b4fd8;--ok:#1a7a4a;--bad:#b42323;--warn:#9a5b00}
*{box-sizing:border-box}
body{margin:0;background:#f3f5fa;color:var(--ink);font-family:'Pretendard','Malgun Gothic','맑은 고딕',system-ui,sans-serif;font-size:15px;line-height:1.6}
.page{max-width:900px;margin:0 auto;padding:28px 24px 60px;background:#fff}
header{border-bottom:3px solid var(--brand);padding-bottom:12px;margin-bottom:18px}
h1{font-size:1.6rem;margin:0 0 4px}
.sub{color:var(--ink2);font-size:.9rem}
.who{display:flex;gap:18px;flex-wrap:wrap;margin-top:12px;font-size:1.05rem}
.who span b{display:inline-block;min-width:110px;border-bottom:1px solid var(--ink);padding:0 6px}
.sum{display:flex;gap:12px;flex-wrap:wrap;margin:14px 0}
.sum div{flex:1 1 180px;border:1px solid var(--line);border-radius:10px;padding:10px 14px}
.sum .big{font-size:1.5rem;font-weight:700;color:var(--brand)}
ul.toc{columns:2;list-style:none;padding-left:0;margin:6px 0 0}
ul.plain{list-style:none;padding-left:0;margin:0}
h3{font-size:1.1rem;margin:22px 0 6px;background:#eef1fd;border-left:6px solid var(--brand);padding:5px 10px}
h4{font-size:1rem;margin:14px 0 6px}
.score{float:right;color:var(--brand)}
table{border-collapse:collapse;width:100%;margin:4px 0 10px;font-size:.92rem}
th,td{border:1px solid var(--line);padding:6px 8px;vertical-align:top;text-align:left}
thead th{background:#f5f7fb}
td.no{width:48px;text-align:center;font-weight:700;white-space:nowrap}
td.res{width:160px}
table.spec th{width:150px;background:#f5f7fb}
pre{white-space:pre-wrap;background:#f7f8fc;border:1px solid var(--line);border-radius:8px;padding:10px 12px;font-size:.88rem;font-family:inherit}
.ok{color:var(--ok)}.wrong{color:var(--bad)}.shown{color:var(--warn)}.none{color:var(--ink2)}
.empty{color:#9aa4b2}
footer{margin-top:40px;border-top:1px solid var(--line);padding-top:10px;color:var(--ink2);font-size:.8rem}
@media print{body{background:#fff}.page{padding:0}h3{break-after:avoid}tr{break-inside:avoid}}
</style></head><body><div class="page">
<header>
<h1>🖐️ 만지는 설명 실험실 — 활동지</h1>
<div class="sub">정보 · Ⅲ. 알고리즘과 프로그래밍 — 문제를 분해·모델링하고, 프로그램을 협력적으로 설계·구현한다</div>
<div class="who"><span>학번 <b>${이스케이프(학번) || '&nbsp;'}</b></span><span>이름 <b>${이스케이프(이름) || '&nbsp;'}</b></span><span>내려받은 때 <b>${날}</b></span></div>
</header>
<div class="sum">
<div>확인 문제 점수<div class="big">${점.맞음} / ${점.전체}</div></div>
<div>끝낸 활동<div class="big">${진.끝} / ${진.전체}</div></div>
</div>
<ul class="toc">${목차}</ul>
${본문}
<footer>
이 활동지는 「만지는 설명 실험실」 앱에서 만들었습니다.<br>
© 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요.
</footer>
</div></body></html>`;
}
