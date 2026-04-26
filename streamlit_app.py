import streamlit as st
import streamlit.components.v1 as components
import os
import re

# 페이지 설정
st.set_page_config(
    page_title="교대조 근무 현황 포털",
    page_icon="📅",
    layout="wide",
    initial_sidebar_state="collapsed"
)

def get_inlined_html():
    dist_dir = os.path.join(os.path.dirname(__file__), 'dist')
    index_path = os.path.join(dist_dir, 'index.html')
    
    if not os.path.exists(index_path):
        return "<h3>빌드 결과물(dist)을 찾을 수 없습니다. 로컬에서 'npm run build'를 먼저 실행해 주세요.</h3>"

    with open(index_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # CSS 인라이닝
    css_match = re.search(r'<link rel="stylesheet".*?href="/assets/(index-.*?\.css)">', html)
    if css_match:
        css_file = css_match.group(1)
        with open(os.path.join(dist_dir, 'assets', css_file), 'r', encoding='utf-8') as f:
            css_content = f.read()
        html = html.replace(css_match.group(0), f'<style>{css_content}</style>')

    # JS 인라이닝
    js_match = re.search(r'<script.*?src="/assets/(index-.*?\.js)".*?></script>', html)
    if js_match:
        js_file = js_match.group(1)
        with open(os.path.join(dist_dir, 'assets', js_file), 'r', encoding='utf-8') as f:
            js_content = f.read()
        # Vite 모듈 스크립트를 일반 스크립트로 변환 (인라이닝 시 호환성)
        html = html.replace(js_match.group(0), f'<script type="text/javascript">{js_content}</script>')

    # 상대 경로 베이스 수정 (필요 시)
    html = html.replace('href="/favicon.svg"', 'href=""')
    
    return html

# 메인 UI
st.markdown("""
    <style>
    .main .block-container {
        padding: 0;
        max-width: 100%;
    }
    iframe {
        border: none;
    }
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    </style>
    """, unsafe_allow_html=True)

html_content = get_inlined_html()

# Streamlit Component로 HTML 렌더링
components.html(html_content, height=1200, scrolling=True)
