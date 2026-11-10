/*! 만지는 설명 실험실 (explorable-lab)
 *  © 2026 티쳐무 · 모든 권리 보유
 *  학교 수업 목적으로만 이용해 주세요. 자세한 내용은 LICENSE 파일을 보세요.
 */
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// 빌드 결과 맨 앞에 남길 저작권 배너.
// ⚠ Vite 8(rolldown)은 output.banner 를 압축에서 지운다. 압축 뒤에 붙는 postBanner 를 쓴다.
const 배너 = `/*! 만지는 설명 실험실 — © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 무단 배포·상업적 이용을 금합니다. */`;

export default defineConfig({
  // GitHub Pages 하위 경로에서도 자원이 열리도록 상대 경로를 쓴다.
  base: './',
  // 빌드 결과를 dist/index.html 한 파일로 묶어 더블클릭만으로 열리게 한다.
  plugins: [viteSingleFile()],
  esbuild: { legalComments: 'inline' },
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    rollupOptions: { output: { postBanner: 배너 } },
  },
});
