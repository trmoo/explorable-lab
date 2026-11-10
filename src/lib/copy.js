/*! 만지는 설명 실험실 — © 2026 티쳐무 · 모든 권리 보유
 *  글 복사하기.
 *  navigator.clipboard 는 보안 연결(https)에서만 열리는 브라우저가 있다.
 *  안 되면 숨긴 글 상자를 골라 execCommand('copy') 로 한 번 더 시도한다.
 */
export async function 복사(글) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(글);
      return true;
    }
  } catch { /* 아래 방법으로 */ }
  try {
    const 상자 = document.createElement('textarea');
    상자.value = 글;
    상자.setAttribute('readonly', '');
    상자.style.position = 'fixed';
    상자.style.opacity = '0';
    document.body.appendChild(상자);
    상자.select();
    const ok = document.execCommand('copy');
    상자.remove();
    return ok;
  } catch {
    return false;
  }
}
