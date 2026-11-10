#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
만지는 설명 실험실 — © 2026 티쳐무 · 모든 권리 보유
학생용 종이 설계지(A4 2쪽) 만들기.  `npm run sheet`  →  docs/만지는설명_설계지.docx

  1쪽  설계지  — 아이디어 점검 · 주제 · 아하 · 예측 질문 · 변수 표 · 화면 스케치 · 바뀌는 것 · 도구
  2쪽  프롬프트 양식 — 빈칸을 채우면 캔버스에 넣을 프롬프트가 된다
       + 프로그래머의 눈 · 고친 기록 · 짝 시험(부숴 보기)

⚠ 「프로그래머의 눈」과 「부숴 보기」 항목은 앱 소스에서 읽어 온다.
  앱과 종이가 서로 다른 말을 하지 않게 하려는 것이다. 항목을 고치면 이 스크립트를 다시 돌린다.
⚠ 한글 글꼴은 rFonts 의 eastAsia 를 따로 지정해야 먹는다.
⚠ 칸마다 빈 문단이 하나씩 남으면 표 줄 높이가 두 배가 된다 → 첫 문단을 재활용한다.
"""
import re
import sys
from pathlib import Path

from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Mm, Pt, RGBColor

뿌리 = Path(__file__).resolve().parent.parent
출력 = 뿌리 / 'docs' / '만지는설명_설계지.docx'
글꼴 = '맑은 고딕'
파랑 = RGBColor(0x24, 0x33, 0xA3)
보라 = RGBColor(0x6A, 0x2B, 0xB8)
회색 = RGBColor(0x5A, 0x67, 0x79)
본문너비 = 180  # mm (A4 210 - 여백 15×2)


# ── 앱 소스에서 항목 읽기 ─────────────────────────────────────
def 앱항목():
    설계 = (뿌리 / 'src/engine/design.js').read_text(encoding='utf-8')
    눈부분 = 설계.split('export const 눈목록')[1].split('];')[0]
    눈 = re.findall(r"이름: '([^']+)'", 눈부분)
    활동 = (뿌리 / 'src/data/activities.js').read_text(encoding='utf-8')
    부숴부분 = 활동.split('export const 부숴보기들')[1].split('];')[0]
    부숴 = re.findall(r"글: '([^']+)'", 부숴부분)
    기술부분 = 설계.split('export const 기술들')[1].split('];')[0]
    기술 = re.findall(r"이름: '([^']+)'", 기술부분)
    대상부분 = 설계.split('export const 대상들')[1].split(';')[0]
    대상 = re.findall(r"'([^']+)'", 대상부분)
    if len(눈) != 8 or len(부숴) < 5 or len(기술) != 4 or not 대상:
        sys.exit(f'앱 소스에서 항목을 읽지 못했습니다 (눈 {len(눈)} · 부숴 {len(부숴)} · 기술 {len(기술)} · 대상 {len(대상)})')
    return 눈, 부숴, 기술, 대상


# ── 글자 꾸미기 잔손 ─────────────────────────────────────────
def 글꼴입히기(run, 크기=10, 굵게=False, 색=None):
    run.font.name = 글꼴
    run.font.size = Pt(크기)
    run.font.bold = 굵게
    if 색 is not None:
        run.font.color.rgb = 색
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn('w:rFonts'))
    if rfonts is None:
        rfonts = OxmlElement('w:rFonts')
        rpr.append(rfonts)
    for k in ('w:ascii', 'w:hAnsi', 'w:eastAsia', 'w:cs'):
        rfonts.set(qn(k), 글꼴)
    return run


def 문단(곳, 글='', 크기=10, 굵게=False, 색=None, 뒤=2, 앞=0, 가운데=False, 문단재활용=None):
    p = 문단재활용 if 문단재활용 is not None else 곳.add_paragraph()
    p.paragraph_format.space_after = Pt(뒤)
    p.paragraph_format.space_before = Pt(앞)
    p.paragraph_format.line_spacing = 1.15
    if 가운데:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if 글:
        글꼴입히기(p.add_run(글), 크기, 굵게, 색)
    return p


def 덧붙이기(p, 글, 크기=10, 굵게=False, 색=None):
    return 글꼴입히기(p.add_run(글), 크기, 굵게, 색)


def 칸색(cell, 색):
    tcpr = cell._element.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), 색)
    tcpr.append(shd)


def 표만들기(doc, 줄, 칸, 너비들):
    """너비를 고정한 표. python-docx 는 표를 「종이 전체 너비」로 잡으므로 칸마다 너비를 지정한다."""
    t = doc.add_table(rows=줄, cols=칸)
    t.style = 'Table Grid'
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    tblpr = t._element.tblPr
    layout = OxmlElement('w:tblLayout')
    layout.set(qn('w:type'), 'fixed')
    tblpr.append(layout)
    for row in t.rows:
        for i, cell in enumerate(row.cells):
            cell.width = Mm(너비들[i])
    return t


def 칸글(cell, 글, 크기=10, 굵게=False, 색=None, 가운데=False):
    p = 문단(cell, 글, 크기, 굵게, 색, 뒤=0, 가운데=가운데, 문단재활용=cell.paragraphs[0])
    return p


def 줄높이(row, mm):
    trpr = row._tr.get_or_add_trPr()
    h = OxmlElement('w:trHeight')
    h.set(qn('w:val'), str(int(mm * 56.7)))
    h.set(qn('w:hRule'), 'atLeast')
    trpr.append(h)


def 머리띠(doc, 번호, 제목, 도움='', 색='E8EBFC'):
    t = 표만들기(doc, 1, 1, [본문너비])
    c = t.rows[0].cells[0]
    칸색(c, 색)
    p = 칸글(c, f'{번호}  {제목}', 11, True, 파랑)
    if 도움:
        덧붙이기(p, f'   {도움}', 8.5, False, 회색)
    간격(doc, 3)


def 간격(doc, pt):
    """빈 문단의 높이를 정확히 pt 로. (빈 문단은 기본 글자 크기만큼 높아져 쪽이 쉽게 넘친다)"""
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.EXACTLY
    p.paragraph_format.line_spacing = Pt(pt)
    return p


def 빈줄(doc, 개수=1, 앞글=''):
    for i in range(개수):
        p = 문단(doc, '', 10, 뒤=1)
        if 앞글 and i == 0:
            덧붙이기(p, 앞글, 9.5, True)
        덧붙이기(p, '_' * (98 if not 앞글 or i else 98 - len(앞글) * 2), 10, False, RGBColor(0xB0, 0xB8, 0xC8))


def 쪽나눔(doc):
    p = doc.add_paragraph()
    p.add_run().add_break(WD_BREAK.PAGE)
    p.paragraph_format.space_after = Pt(0)


# ── 1쪽: 설계지 ─────────────────────────────────────────────
def 첫쪽(doc, 기술, 대상):
    p = 문단(doc, '🖐️ 만지는 설명 설계지', 17, True, 파랑, 뒤=0)
    덧붙이기(p, '   익스플로러블 익스플래네이션 · 1차시', 9.5, False, 회색)
    t = 표만들기(doc, 1, 4, [25, 65, 25, 65])
    for i, 글 in enumerate(['학번', '', '이름', '']):
        칸글(t.rows[0].cells[i], 글, 10, True, 가운데=True)
        if 글:
            칸색(t.rows[0].cells[i], 'F3F5FB')
    간격(doc, 4)

    머리띠(doc, '0', '아이디어 점검', '세 칸에 모두 ☑ 할 수 있어야 좋은 아이디어')
    t = 표만들기(doc, 1, 3, [60, 60, 60])
    for i, 글 in enumerate(['☐ 바꿀 값이 있다 (변수 1~3개)', '☐ 바꾸면 바뀌는 게 보인다', '☐ 예측이 빗나갈 「아하」가 있다']):
        칸글(t.rows[0].cells[i], 글, 9.5)
    간격(doc, 4)

    머리띠(doc, '1', '무엇을 보여 줄까')
    t = 표만들기(doc, 3, 2, [32, 148])
    칸글(t.rows[0].cells[0], '과목·단원', 9.5, True)
    칸글(t.rows[1].cells[0], '주제(개념)', 9.5, True)
    칸글(t.rows[2].cells[0], '누가 쓰나', 9.5, True)
    칸글(t.rows[2].cells[1], '   '.join('☐ ' + x for x in 대상), 9.5)
    for r in t.rows:
        칸색(r.cells[0], 'F3F5FB')
        줄높이(r, 8)
    간격(doc, 4)

    머리띠(doc, '2', '「아하!」와 예측 질문', '아하 문장에 변수 이름을 넣으면 더 분명해져요')
    빈줄(doc, 2, '아하! 한 문장: ')
    빈줄(doc, 1, '예측 질문(~하면 어떻게 될까?): ')
    간격(doc, 3)

    머리띠(doc, '3', '바꿀 변수 (1~3개)', '꾸미기(색·글꼴·배경)는 변수가 아니에요')
    t = 표만들기(doc, 4, 5, [60, 30, 30, 30, 30])
    for i, 글 in enumerate(['변수 이름', '최솟값', '최댓값', '처음 값', '단위']):
        칸글(t.rows[0].cells[i], 글, 9.5, True, 가운데=True)
        칸색(t.rows[0].cells[i], 'F3F5FB')
    for r in t.rows[1:]:
        줄높이(r, 8)
    간격(doc, 4)

    머리띠(doc, '4', '화면 스케치와 바뀌는 것', '그림·그래프·숫자·조작 요소의 자리를 그려 보세요')
    t = 표만들기(doc, 1, 1, [본문너비])
    줄높이(t.rows[0], 64)
    칸글(t.rows[0].cells[0], '(화면 스케치)', 8.5, False, 회색)
    간격(doc, 3)
    빈줄(doc, 2, '값을 바꾸면 무엇이 변하나: ')
    간격(doc, 3)

    머리띠(doc, '5', '만드는 도구')
    문단(doc, '   '.join('☐ ' + x for x in 기술), 9.5, 뒤=0)


# ── 2쪽: 프롬프트 양식 · 프로그래머의 눈 · 고친 기록 · 짝 시험 ────────────
def 둘째쪽(doc, 눈, 부숴):
    p = 문단(doc, '🪄 프롬프트 양식', 15, True, 파랑, 뒤=0)
    덧붙이기(p, '   빈칸을 채우면 그대로 제미나이 캔버스에 넣을 프롬프트가 됩니다 · 2차시', 9, False, 회색)
    t = 표만들기(doc, 1, 1, [본문너비])
    c = t.rows[0].cells[0]
    칸색(c, 'FAFAFD')
    줄들 = [
        ('', '__________(도구)로 그리는 인터랙티브 웹앱을 HTML 파일 하나로 만들어줘.'),
        ('', '주제는 「______________________」이고, 쓰는 사람은 __________이야.'),
        ('[화면 구성]', '- ______________________________________________'),
        ('[조작 요소]', '- __________ 슬라이더 (_____ ~ _____, 처음 값 _____)'),
        ('', '- __________ 슬라이더 (_____ ~ _____, 처음 값 _____)'),
        ('', '- __________ 슬라이더 (_____ ~ _____, 처음 값 _____)'),
        ('[피드백]', '- 값을 바꾸면 바로: ______________________________'),
        ('[학습 목표]', '- 학생이 스스로 이 물음의 답을 찾게 하는 것이 목표야: "__________________________"'),
        ('', '- 깨달았으면 하는 것: ____________________________________'),
        ('', '- 정답을 먼저 알려 주지 말고, 값을 바꿔 보며 발견하게 해줘.'),
        ('', '- 조작하기 전에 위 물음을 먼저 보여 주고 예측을 고르게 한 다음, 조작 화면이 열리게 해줘.'),
        ('[대상에 맞게]', '- 안내 문구는 __________이 이해할 수 있는 쉬운 우리말로 써줘.'),
        ('[꼼꼼하게]', '- (아래 「프로그래머의 눈」에서 ☑ 한 것을 한 줄씩)'),
    ]
    처음 = True
    for 머리, 글 in 줄들:
        p = 문단(c, '', 9.5, 뒤=1, 문단재활용=c.paragraphs[0] if 처음 else None)
        처음 = False
        if 머리:
            덧붙이기(p, 머리 + '  ', 9.5, True, 보라)
        덧붙이기(p, 글, 9.5)
    p = 문단(doc, '', 9, 뒤=0, 앞=2)
    덧붙이기(p, '캔버스 켜기  ', 9, True, 보라)
    덧붙이기(p, '입력창 왼쪽 ＋ → 도구 더보기 → Canvas  ·  캔버스가 켜진 채로 위 프롬프트를 보낸다', 9)
    간격(doc, 4)

    머리띠(doc, '🧑‍💻', '프로그래머의 눈 — 켤 것에 ☑', '처음 만드는 사람은 떠올리기 어려운 것들', 'F4EDFD')
    t = 표만들기(doc, 4, 2, [90, 90])
    for i, 이름 in enumerate(눈):
        칸글(t.rows[i // 2].cells[i % 2], f'☐ {이름}', 9.5)
    간격(doc, 4)

    머리띠(doc, '📒', '고친 기록', '한 번에 하나씩 · 망가지면 ↶ 로 앞 판 · 오류는 메시지째 붙여 넣기 · 꼬이면 새 채팅에 정리해서')
    t = 표만들기(doc, 4, 3, [14, 116, 50])
    for i, 글 in enumerate(['번호', '고쳐 달라고 한 것 (하나만)', '결과']):
        칸글(t.rows[0].cells[i], 글, 9.5, True, 가운데=True)
        칸색(t.rows[0].cells[i], 'F3F5FB')
    for n, r in enumerate(t.rows[1:], 1):
        칸글(r.cells[0], str(n), 9.5, 가운데=True)
        칸글(r.cells[2], '☐잘됨 ☐조금 ☐망가짐', 8.5)
        줄높이(r, 7)
    문단(doc, '공유 링크(🔗)  또는  HTML 파일 이름: ' + '_' * 56, 9.5, 뒤=2, 앞=3)

    머리띠(doc, '🧪', '짝 시험 — 짝이 적어 주세요', '짝의 이름은 적지 않아요')
    빈줄(doc, 1, '앱을 열기 전 짝의 예측: ')
    문단(doc, '「아하!」가 왔나요?   ☐ 왔다   ☐ 조금   ☐ 아니', 9.5, 뒤=2)
    문단(doc, '🔨 부숴 보기 (3가지 이상)', 9.5, True, 뒤=1)
    t = 표만들기(doc, (len(부숴) + 1) // 2, 2, [90, 90])
    for i, 글 in enumerate(부숴):
        칸글(t.rows[i // 2].cells[i % 2], f'☐ {글}', 8.5)
    간격(doc, 3)
    빈줄(doc, 1, '고치면 좋을 점 하나: ')
    빈줄(doc, 1, '(만든 사람) 내가 고칠 것: ')
    문단(doc, '© 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요.', 7.5, False, 회색, 앞=4, 가운데=True)


def main():
    눈, 부숴, 기술, 대상 = 앱항목()
    doc = Document()
    sec = doc.sections[0]
    sec.orientation = WD_ORIENT.PORTRAIT
    sec.page_width, sec.page_height = Mm(210), Mm(297)
    for k in ('left_margin', 'right_margin'):
        setattr(sec, k, Mm(15))
    sec.top_margin = Mm(13)
    sec.bottom_margin = Mm(12)
    doc.core_properties.author = '티쳐무'
    doc.core_properties.title = '만지는 설명 설계지'
    doc.core_properties.comments = '© 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요.'
    # 기본 문단 간격을 0 으로 (워드 기본값 8pt 가 쌓이면 쪽이 넘친다)
    st = doc.styles['Normal']
    st.paragraph_format.space_after = Pt(0)
    st.font.name = 글꼴
    st.element.rPr.rFonts.set(qn('w:eastAsia'), 글꼴)

    첫쪽(doc, 기술, 대상)
    쪽나눔(doc)
    둘째쪽(doc, 눈, 부숴)

    출력.parent.mkdir(exist_ok=True)
    try:
        doc.save(출력)
    except PermissionError:
        sys.exit(f'⚠ {출력.name} 이 워드에서 열려 있어 저장하지 못했습니다. 닫고 다시 돌리세요.')
    print(f'✅ {출력.relative_to(뿌리)}  (프로그래머의 눈 {len(눈)} · 부숴 보기 {len(부숴)})')


if __name__ == '__main__':
    main()
