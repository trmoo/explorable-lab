/*! 만지는 설명 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  활동 목록·문항·완료 조건·활동지 시험.
 */
import { 묶음, 확인, 참 } from './harness.mjs';
import { 탭들, 활동들, 완료인가, 진행률, 전체점수, 부숴보기들 } from '../src/data/activities.js';
import { 예시들 } from '../src/data/explores.js';
import { 활동지HTML, 파일이름 } from '../src/lib/report.js';
import { 검사, 빈기록 } from '../src/lib/store.js';

묶음('활동 목록');
{
  참('활동 열쇠가 겹치지 않는다', new Set(활동들.map((a) => a.key)).size === 활동들.length);
  참('모든 활동이 실재하는 탭에 있다', 활동들.every((a) => 탭들.some((t) => t.id === a.탭)));
  참('모든 탭에 활동이 하나 이상', 탭들.every((t) => 활동들.some((a) => a.탭 === t.id)));
  확인('1차시 탭 셋 · 2차시 탭 셋', [탭들.filter((t) => t.차시 === 1).length, 탭들.filter((t) => t.차시 === 2).length], [3, 3]);
  for (const a of 활동들.filter((x) => x.종류 === 'quiz')) {
    참(`${a.key} — 문항 id 가 겹치지 않는다`, new Set(a.문항.map((q) => q.id)).size === a.문항.length);
    for (const q of a.문항) {
      참(`${a.key}/${q.id} — 정답 번호가 보기 안에 있다`, Number.isInteger(q.답) && q.답 >= 0 && q.답 < q.보기.length);
      참(`${a.key}/${q.id} — 힌트와 해설이 있다`, !!q.힌트 && !!q.해설);
      참(`${a.key}/${q.id} — 보기가 겹치지 않는다`, new Set(q.보기).size === q.보기.length);
    }
  }
  for (const a of 활동들.filter((x) => x.종류 === 'explore')) {
    const e = 예시들[a.예시];
    참(`${a.key} — 예시가 있다`, !!e);
    참(`${a.key} — 실제 답 번호가 보기 안에 있다`, e.실제 >= 0 && e.실제 < e.보기.length);
  }
  // 아이디어 카드는 좋음·아쉬움이 반반이어야 찍기로 맞히기 어렵다
  const 아이디어 = 활동들.find((a) => a.key === 'pick-idea').문항;
  확인('아이디어 카드 좋음 5 · 아쉬움 5', [아이디어.filter((q) => q.답 === 0).length, 아이디어.filter((q) => q.답 === 1).length], [5, 5]);
  // 프로그래머의 눈 문제는 정답이 한쪽에 몰리지 않게
  const 눈 = 활동들.find((a) => a.key === 'eye-quiz').문항;
  확인('눈 문제 여섯은 정답이 모두 다르다', new Set(눈.map((q) => q.답)).size, 6);
}

const 다한기록 = () => {
  const 기록 = 빈기록();
  for (const a of 활동들.filter((x) => x.종류 === 'quiz')) {
    기록.acts[a.key] = Object.fromEntries(a.문항.map((q) => [q.id, { a: q.답, ok: true, n: 1, shown: false }]));
  }
  for (const k of ['dice', 'reg', 'sort']) 기록.data['ex-' + k] = { 예측: 0, 조작: true, 설명: '예측과 달라서 놀랐다. 많이 던질수록 평균이 모였다.' };
  기록.data.design = {
    과목: '수학', 주제: '생일 문제', 대상: '고등학생', 아하: '사람 수가 23명만 되어도 절반을 넘는다.', 예측: '몇 명이면 절반을 넘을까?',
    변수: [{ 이름: '사람 수', 최소: '2', 최대: '60', 기본: '10', 단위: '명' }], 화면: '왼쪽에 달력 점, 오른쪽에 그래프', 결과: '확률 숫자와 그래프 점이 바뀐다',
    기술: 'canvas', 예측먼저: true, 눈: { 초기화: true },
  };
  기록.data.prompt = { 복사: true, 글: '프롬프트' };
  기록.data.build = { 링크: 'https://gemini.google.com/share/abc', 기록: [{ 요청: '글자를 크게 해 달라고 함', 결과: '✅ 잘 고쳐짐' }] };
  기록.data.pair = { 아하: '🤩 왔다', 부숴: { 끝값: true, 연타: true, 초기화: true }, 고칠점: '처음에 무엇을 해야 할지 안내가 없었다', 내고칠: '맨 위에 안내 문장을 넣겠다' };
  기록.data.reflect = { 배운점: '예측을 먼저 묻는 것이 배움을 만든다는 것을 알았다.' };
  return 기록;
};

묶음('완료 조건');
{
  const 빈 = 빈기록();
  확인('빈 기록은 0개 완료', 진행률(빈).끝, 0);
  const 다 = 다한기록();
  확인('모두 한 기록은 전부 완료', 진행률(다), { 끝: 활동들.length, 전체: 활동들.length });
  const 문항수 = 활동들.filter((a) => a.종류 === 'quiz').reduce((s, a) => s + a.문항.length, 0);
  확인('맞힌 문항 = 전체', 전체점수(다), { 맞음: 문항수, 전체: 문항수 });

  const 활 = (k) => 활동들.find((a) => a.key === k);
  const 고쳐 = (f) => { const r = 다한기록(); f(r); return r; };
  참('예측 없이는 맛보기 미완료', !완료인가(고쳐((r) => { r.data['ex-dice'].예측 = null; }), 활('ex-dice')));
  참('조작 없이는 맛보기 미완료', !완료인가(고쳐((r) => { r.data['ex-dice'].조작 = false; }), 활('ex-dice')));
  참('설명이 짧으면 맛보기 미완료', !완료인가(고쳐((r) => { r.data['ex-dice'].설명 = '몰라'; }), 활('ex-dice')));
  참('예측 0번(첫 보기)도 예측으로 인정 (0 은 빈 값이 아니다)', 완료인가(다한기록(), 활('ex-dice')));
  참('대화창 주소(/app)로는 제작 미완료', !완료인가(고쳐((r) => { r.data.build.링크 = 'https://gemini.google.com/app/1'; }), 활('build')));
  참('고친 기록이 비면 제작 미완료', !완료인가(고쳐((r) => { r.data.build.기록 = [{ 요청: '', 결과: '' }]; }), 활('build')));
  참('부숴 보기 둘뿐이면 짝 시험 미완료', !완료인가(고쳐((r) => { r.data.pair.부숴 = { 끝값: true, 연타: true }; }), 활('pair')));
  참('복사하지 않았으면 프롬프트 미완료', !완료인가(고쳐((r) => { r.data.prompt = {}; }), 활('prompt')));
  참('부숴 보기 항목 id 가 겹치지 않는다', new Set(부숴보기들.map((x) => x.id)).size === 부숴보기들.length);
}

묶음('활동지');
{
  const 다 = 다한기록();
  const html = 활동지HTML(다, { 학번: '30512', 이름: '홍길동', 날짜: new Date(2026, 10, 10, 9, 5) });
  참('학번·이름이 들어간다', html.includes('30512') && html.includes('홍길동'));
  참('날짜가 들어간다', html.includes('2026년 11월 10일 09:05'));
  참('저작권 표시', html.includes('© 2026 티쳐무'));
  참('공유 링크가 들어간다', html.includes('https://gemini.google.com/share/abc'));
  참('고친 기록이 들어간다', html.includes('글자를 크게 해 달라고 함'));
  참('설계의 아하 문장', html.includes('23명만'));
  참('켠 프로그래머의 눈', html.includes('처음으로 되돌리기'));
  참('바깥 자원을 부르지 않는다', !/<(script|link|img)\b/i.test(html));
  const 나쁜 = 다한기록();
  나쁜.data.reflect.배운점 = '<script>alert(1)</script>';
  나쁜.data.design.주제 = '<img src=x onerror=alert(1)>';
  const h2 = 활동지HTML(나쁜, { 이름: '<b>해커</b>' });
  참('학생 글의 태그는 글자로만 찍힌다', !h2.includes('<script>alert') && !h2.includes('<img src=x') && h2.includes('&lt;script&gt;'));
  참('이름의 태그도 글자로', h2.includes('&lt;b&gt;해커'));
  참('빈 기록도 활동지가 만들어진다', 활동지HTML(빈기록()).includes('아직 설계하지 않음'));
  확인('파일 이름', 파일이름('30512', '홍 길동'), '만지는설명_활동지_30512_홍길동.html');
  확인('파일 이름에 못 쓰는 글자를 걷어 낸다', 파일이름('3/0', '이:름'), '만지는설명_활동지_30_이름.html');
  확인('학번·이름이 없으면', 파일이름('', ''), '만지는설명_활동지.html');
}

묶음('저장 기록 검사');
{
  확인('다른 앱의 파일은 거절', 검사({ app: 'computer-spec', v: 1, acts: {}, data: {} }), null);
  const 끼움 = 검사({ app: 'explorable-lab', v: 1, acts: {}, data: { design: { 주제: 'x' } }, 학번: '30512', 이름: '홍길동' });
  참('알 수 없는 칸(학번·이름)은 버린다', 끼움 && !('학번' in 끼움) && !('이름' in 끼움));
}

묶음('캔버스로 만들기 — HTML 파일로 낸 경우');
{
  const 활 = 활동들.find((a) => a.key === 'build');
  const r = 다한기록();
  r.data.build = { 방식: 'file', 파일: '30512_진자실험실.html', 링크: '', 기록: [{ 요청: '글자를 크게 해 달라고 함', 결과: '✅ 잘 고쳐짐' }] };
  참('링크 없이 HTML 파일로 내도 완료', 완료인가(r, 활));
  r.data.build.파일 = '진자.txt';
  참('.txt 로 저장했으면 미완료', !완료인가(r, 활));
  r.data.build = { 방식: 'link', 파일: '30512.html', 링크: '', 기록: [{ 요청: '글자를 크게 해 달라고 함', 결과: '' }] };
  참('링크 방식이면 파일 이름만으로는 미완료', !완료인가(r, 활));
  const 파일기록 = 다한기록();
  파일기록.data.build = { 방식: 'file', 파일: '30512_진자.html', 기록: [{ 요청: '글자를 크게 해 달라고 함', 결과: '✅ 잘 고쳐짐' }] };
  const html = 활동지HTML(파일기록);
  참('활동지에 HTML 파일로 냈다고 적힌다', html.includes('HTML 파일로 냄') && html.includes('30512_진자.html'));
  const 캔버스 = 활동들.find((a) => a.key === 'canvas-quiz').문항;
  참('캔버스 문제는 정답 자리가 고루 퍼져 있다(같은 자리 최대 2개)', Object.values(캔버스.reduce((m, q) => ({ ...m, [q.답]: (m[q.답] || 0) + 1 }), {})).every((n) => n <= 2));
}
