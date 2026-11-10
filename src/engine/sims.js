/*! 만지는 설명 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  맛보기 예시 셋(주사위·회귀선·정렬)의 계산.
 *
 *  ⚠ 「계산」과 「그리기」를 나눈다. 이 파일은 숫자만 내고 DOM 을 건드리지 않는다.
 *    그래야 node 에서 시험할 수 있고, 그림이 이상할 때 계산이 틀렸는지 그림이 틀렸는지 가를 수 있다.
 *    (학생에게 가르치는 「프로그래머의 눈」 가운데 하나를 이 앱이 스스로 지킨다)
 */

// ── 시드가 있는 난수 ─────────────────────────────────────────
// Math.random() 은 다시 똑같이 만들 수 없다. 시드(씨앗 번호)가 같으면 같은 수열이 나오게 한다.
// 수업에서 「아까 그 결과 다시 보여 줘」가 되려면 꼭 필요하다. (mulberry32 방식)
export function 시드난수(시드) {
  let a = (Number(시드) >>> 0) || 1;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── ① 주사위 · 큰 수의 법칙 ──────────────────────────────────
// 조작된 주사위는 6 이 다른 눈보다 세 배 잘 나온다 → 6 이 나올 확률 3/8.
export const 조작무게 = [1, 1, 1, 1, 1, 3];

export function 주사위한번(rng, 조작 = false) {
  if (!조작) return 1 + Math.floor(rng() * 6);
  const 합 = 조작무게.reduce((a, b) => a + b, 0);
  let r = rng() * 합;
  for (let i = 0; i < 6; i++) {
    r -= 조작무게[i];
    if (r < 0) return i + 1;
  }
  return 6;
}

// 이론상 평균(기댓값). 공정하면 3.5, 조작하면 33/8 = 4.125
export function 기댓값(조작 = false) {
  if (!조작) return 3.5;
  const 합 = 조작무게.reduce((a, b) => a + b, 0);
  return 조작무게.reduce((s, w, i) => s + w * (i + 1), 0) / 합;
}

// 던진 기록을 요약한다. 누적 평균은 그림에 쓰기 좋게 최대 점 개수로 솎아 낸다.
export function 주사위요약(던짐, 최대점 = 240) {
  const 개수 = [0, 0, 0, 0, 0, 0];
  let 합 = 0;
  const 누적 = [];
  const 간격 = Math.max(1, Math.ceil(던짐.length / 최대점));
  던짐.forEach((v, i) => {
    개수[v - 1]++;
    합 += v;
    if ((i + 1) % 간격 === 0 || i === 던짐.length - 1) 누적.push({ n: i + 1, 평균: 합 / (i + 1) });
  });
  const n = 던짐.length;
  return {
    n,
    개수,
    상대도수: 개수.map((c) => (n ? c / n : 0)),
    평균: n ? 합 / n : null,   // ⚠ 0번 던졌을 때 0 으로 나누지 않는다
    누적,
  };
}

// ── ② 회귀선 · 평균과 중앙값 ─────────────────────────────────
export function 평균(수들) {
  if (!수들.length) return null;
  return 수들.reduce((a, b) => a + b, 0) / 수들.length;
}

export function 중앙값(수들) {
  if (!수들.length) return null;
  const s = [...수들].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// 최소제곱 회귀선 y = 기울기·x + 절편 과 상관계수 r.
// ⚠ 경계값 — 점이 2개 미만이거나 x 가 모두 같으면 직선을 정할 수 없다 → null 을 돌려준다.
//   y 가 모두 같으면 기울기 0 직선은 되지만 r 은 정할 수 없다 → r: null.
export function 회귀선(점들) {
  const n = 점들.length;
  if (n < 2) return null;
  const mx = 평균(점들.map((p) => p.x));
  const my = 평균(점들.map((p) => p.y));
  let sxx = 0, syy = 0, sxy = 0;
  for (const p of 점들) {
    sxx += (p.x - mx) ** 2;
    syy += (p.y - my) ** 2;
    sxy += (p.x - mx) * (p.y - my);
  }
  if (sxx < 1e-12) return null;
  const 기울기 = sxy / sxx;
  return {
    기울기,
    절편: my - 기울기 * mx,
    r: syy < 1e-12 ? null : sxy / Math.sqrt(sxx * syy),
  };
}

// 공부 시간(시간) ↔ 시험 점수 — 수업용으로 지어낸 점 10개
export const 기본점들 = [
  { x: 1, y: 52 }, { x: 2, y: 58 }, { x: 2.5, y: 55 }, { x: 3, y: 63 }, { x: 4, y: 66 },
  { x: 5, y: 70 }, { x: 5.5, y: 74 }, { x: 6, y: 71 }, { x: 7, y: 80 }, { x: 8, y: 84 },
];

// ── ③ 정렬 비교 ───────────────────────────────────────────────
export const 정렬방법들 = [
  { id: 'bubble', 이름: '버블 정렬' },
  { id: 'selection', 이름: '선택 정렬' },
  { id: 'insertion', 이름: '삽입 정렬' },
];

export const 배열모양들 = [
  { id: 'random', 이름: '무작위' },
  { id: 'sorted', 이름: '이미 정렬됨' },
  { id: 'reversed', 이름: '거꾸로 정렬됨' },
];

// 1~n 을 모양에 맞게 늘어놓는다. 무작위는 시드를 받아 다시 만들 수 있다(피셔-예이츠 섞기).
export function 배열만들기(n, 모양, 시드 = 1) {
  const a = Array.from({ length: n }, (_, i) => i + 1);
  if (모양 === 'sorted') return a;
  if (모양 === 'reversed') return a.reverse();
  const rng = 시드난수(시드);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 정렬하며 한 걸음씩 기록한다. 걸음마다 그때의 배열을 복사해 두어 「한 걸음씩」·「되감기」가 된다.
//   걸음 = { 종류: '비교'|'교환'|'끝', i, j, 배열, 비교, 교환 }
// 버블 정렬은 한 바퀴 동안 한 번도 바꾸지 않으면 이미 정렬된 것이므로 일찍 멈춘다.
export function 정렬걸음(원본, 방법) {
  const a = [...원본];
  const 걸음 = [];
  let 비교 = 0, 교환 = 0;
  const 적기 = (종류, i, j) => 걸음.push({ 종류, i, j, 배열: [...a], 비교, 교환 });
  const 바꾸기 = (i, j) => { [a[i], a[j]] = [a[j], a[i]]; 교환++; 적기('교환', i, j); };
  const n = a.length;

  if (방법 === 'bubble') {
    for (let 끝 = n - 1; 끝 > 0; 끝--) {
      let 바뀜 = false;
      for (let i = 0; i < 끝; i++) {
        비교++; 적기('비교', i, i + 1);
        if (a[i] > a[i + 1]) { 바꾸기(i, i + 1); 바뀜 = true; }
      }
      if (!바뀜) break;
    }
  } else if (방법 === 'selection') {
    for (let i = 0; i < n - 1; i++) {
      let 최소 = i;
      for (let j = i + 1; j < n; j++) {
        비교++; 적기('비교', 최소, j);
        if (a[j] < a[최소]) 최소 = j;
      }
      if (최소 !== i) 바꾸기(i, 최소);
    }
  } else if (방법 === 'insertion') {
    for (let i = 1; i < n; i++) {
      let j = i;
      while (j > 0) {
        비교++; 적기('비교', j - 1, j);
        if (a[j - 1] > a[j]) { 바꾸기(j - 1, j); j--; } else break;
      }
    }
  }
  적기('끝', -1, -1);
  return 걸음;
}

// 반응하는 문장 — 「하루 ○분씩 공부하면 1년에 ○시간」
export function 일년시간(하루분) {
  return Math.round((하루분 * 365) / 60);
}
