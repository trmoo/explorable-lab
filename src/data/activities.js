/*! 만지는 설명 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  탭·활동 목록과 채점 — 활동 목록의 단일 출처.
 *
 *  종류
 *    quiz    — 고르기 문항. 누르면 바로 채점, 틀리면 힌트, 두 번 틀리면 [정답 보기].
 *    explore — 맛보기 예시. 예측 고르기 + 조작해 보기 + 설명 쓰기(채점 없음, 했는가만).
 *    design · prompt · build · pair · reflect — 설계·제작·짝 시험·정리(했는가만).
 *
 *  ⚠ 활동을 늘릴 때는 여기와 탭 화면을 함께 고친다. test/activities.test.mjs 가 어긋남을 잡는다.
 *  ⚠ DOM 을 만들지 말 것.
 */
import { 개념문제, 아이디어문제, 변수문제, 눈문제, 캔버스문제 } from './quizzes.js';
import { 설계완료, 링크검사, 파일이름검사, 글자수 } from '../engine/design.js';

export { 글자수 };

export const 탭들 = [
  { id: 'taste', 이름: '① 맛보기', 차시: 1 },
  { id: 'pick', 이름: '② 아이디어 고르기', 차시: 1 },
  { id: 'design', 이름: '③ 설계하기', 차시: 1 },
  { id: 'prompt', 이름: '④ 프롬프트·제작', 차시: 2 },
  { id: 'test', 이름: '⑤ 짝 시험', 차시: 2 },
  { id: 'report', 이름: '⑥ 내 활동지', 차시: 2 },
];

export const 활동들 = [
  { key: 'taste-intro', 탭: 'taste', 화면: 'intro', 제목: '만지는 설명이란? 확인 문제', 종류: 'quiz', 문항: 개념문제 },
  { key: 'ex-dice', 탭: 'taste', 화면: 'dice', 제목: '맛보기 ① 주사위와 큰 수의 법칙', 종류: 'explore', 예시: 'dice' },
  { key: 'ex-reg', 탭: 'taste', 화면: 'reg', 제목: '맛보기 ② 평균과 중앙값', 종류: 'explore', 예시: 'reg' },
  { key: 'ex-sort', 탭: 'taste', 화면: 'sort', 제목: '맛보기 ③ 정렬 비교 횟수', 종류: 'explore', 예시: 'sort' },
  { key: 'pick-idea', 탭: 'pick', 화면: 'idea', 제목: '좋은 아이디어 고르기', 종류: 'quiz', 문항: 아이디어문제 },
  { key: 'pick-var', 탭: 'pick', 화면: 'var', 제목: '바꿀 변수 찾기', 종류: 'quiz', 문항: 변수문제 },
  { key: 'design', 탭: 'design', 화면: 'main', 제목: '나의 만지는 설명 설계', 종류: 'design' },
  { key: 'eye-quiz', 탭: 'prompt', 화면: 'eye', 제목: '프로그래머의 눈 확인 문제', 종류: 'quiz', 문항: 눈문제 },
  { key: 'prompt', 탭: 'prompt', 화면: 'make', 제목: '프롬프트 조립해 복사하기', 종류: 'prompt' },
  { key: 'canvas-quiz', 탭: 'prompt', 화면: 'tour', 제목: '캔버스 둘러보기 확인 문제', 종류: 'quiz', 문항: 캔버스문제 },
  { key: 'build', 탭: 'prompt', 화면: 'canvas', 제목: '캔버스로 만들고 고친 기록', 종류: 'build' },
  { key: 'pair', 탭: 'test', 화면: 'main', 제목: '짝 시험과 부숴 보기', 종류: 'pair' },
  { key: 'reflect', 탭: 'report', 화면: 'main', 제목: '오늘의 배움 정리', 종류: 'reflect' },
];

export const 활동찾기 = (key) => 활동들.find((a) => a.key === key);

// ── 문항 채점 ────────────────────────────────────────────────
export function 정답인가(문항, 값) {
  return Number(값) === 문항.답;
}
export function 정답글(문항) {
  return 문항.보기[문항.답];
}
export function 답글(문항, 기록) {
  if (!기록 || 기록.a == null || 기록.a === '') return '';
  return 문항.보기[Number(기록.a)] ?? '';
}

export function 활동점수(기록, 활동) {
  if (활동.종류 !== 'quiz') return null;
  const 답들 = 기록.acts[활동.key] || {};
  let 맞음 = 0, 푼 = 0;
  for (const 문항 of 활동.문항) {
    const r = 답들[문항.id];
    if (!r) continue;
    if (r.ok) { 맞음++; 푼++; } else if (r.shown) 푼++;
  }
  return { 맞음, 전체: 활동.문항.length, 푼 };
}

export function 전체점수(기록) {
  let 맞음 = 0, 전체 = 0;
  for (const 활동 of 활동들) {
    const 점 = 활동점수(기록, 활동);
    if (!점) continue;
    맞음 += 점.맞음;
    전체 += 점.전체;
  }
  return { 맞음, 전체 };
}

// 서술 칸의 최소 글자 수 (빈칸을 막는 정도로만)
export const 최소글자 = { 설명: 15, 고친요청: 8, 고칠점: 10, 내고칠: 10, 배운점: 20 };

// 부숴 보기 항목 — 짝 시험에서 일부러 앱을 괴롭혀 본다
export const 부숴보기들 = [
  { id: '끝값', 글: '슬라이더를 맨 왼쪽·맨 오른쪽 끝까지 밀어 보았다' },
  { id: '연타', 글: '단추를 아주 빠르게 여러 번 눌러 보았다' },
  { id: '초기화', 글: '처음으로 돌아가는 방법이 있는지 찾아 보았다' },
  { id: '빈값', 글: '0이나 빈 값을 넣어 보았다 (입력 칸이 있다면)' },
  { id: '좁은화면', 글: '창을 좁게(휴대폰처럼) 만들어 보았다' },
  { id: '예측먼저', 글: '조작하기 전에 예측부터 묻는지 보았다' },
];
export const 최소부숴보기 = 3;

export function 완료인가(기록, 활동) {
  const d = 기록.data || {};
  switch (활동.종류) {
    case 'quiz': {
      const 점 = 활동점수(기록, 활동);
      return 점.푼 === 점.전체;
    }
    case 'explore': {
      const e = d['ex-' + 활동.예시];
      return !!(e && e.예측 != null && e.조작 && 글자수(e.설명) >= 최소글자.설명);
    }
    case 'design': return 설계완료(d.design);
    case 'prompt': return !!d.prompt?.복사;
    case 'build': {
      const b = d.build || {};
      // 공유 링크가 막힌 학교 계정이면 HTML 파일로 내도 된다
      const 냈음 = b.방식 === 'file' ? 파일이름검사(b.파일).ok : 링크검사(b.링크).ok;
      return 냈음 && (b.기록 || []).some((r) => 글자수(r.요청) >= 최소글자.고친요청);
    }
    case 'pair': {
      const p = d.pair || {};
      const 체크 = 부숴보기들.filter((x) => p.부숴?.[x.id]).length;
      return !!p.아하 && 체크 >= 최소부숴보기
        && 글자수(p.고칠점) >= 최소글자.고칠점 && 글자수(p.내고칠) >= 최소글자.내고칠;
    }
    case 'reflect': return 글자수(d.reflect?.배운점) >= 최소글자.배운점;
    default: return false;
  }
}

export function 진행률(기록) {
  const 끝 = 활동들.filter((a) => 완료인가(기록, a)).length;
  return { 끝, 전체: 활동들.length };
}
